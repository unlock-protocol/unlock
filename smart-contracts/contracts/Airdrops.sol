/* solhint-disable no-inline-assembly */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

interface SanctionsList {
  function isSanctioned(address addr) external view returns (bool);
}

// Custom errors
error MissingCampaign(bytes32 campaignHash);
error WrongSigner(bytes32 campaignHash, address expected);
error InvalidProof(
  bytes32 campaignHash,
  address recipient,
  uint amount,
  bytes32[] proof
);
error AlreadyClaimed(
  bytes32 campaignHash,
  address recipient,
  uint amount,
  bytes32[] proof
);

error UserBlocked(address recipient);

/**
 * @title Airdrops
 * @notice This contract handles airdrop claims protected by a Merkle tree and TOS signature verification.
 * The contract allows only those who have signed the campaign's Terms of Service (TOS) to claim tokens.
 * The owner sets up campaigns with a TOS and a corresponding Merkle root representing eligible entries.
 */
contract Airdrops is Ownable, EIP712 {
  using ECDSA for bytes32;

  /// @notice Structure representing a campaign's TOS hash and its corresponding Merkle tree root.
  struct Campaign {
    string name;
    bytes32 merkleRoot;
  }

  /// @notice The ERC20 token to be airdropped (UP)
  IERC20 public immutable token;

  /// @notice Mapping from campaign name to campaign details.
  mapping(bytes32 => Campaign) public campaigns;

  /// @notice Mapping of Merkle tree leaves that have been claimed.
  mapping(bytes32 => mapping(bytes32 => uint)) public claimedLeafs;

  /// @notice Mapping of addresses that are blocklisted.
  mapping(address => bool) public blocklist;

  /// @notice Chainalysis sanction oracle
  address public chainalysisOracle;

  /// @notice Emitted when a campaign is set.
  event CampaignSet(bytes32 indexed campaign, bytes32 merkleRoot);

  /// @notice Emitted when tokens are claimed.
  event TokensClaimed(
    bytes32 indexed campaign,
    address indexed recipient,
    uint256 amount
  );

  event AddedToBlockList(address indexed recipient);
  event RemovedFromBlockList(address indexed recipient);
  event ChainalysisOracleSet(address indexed chainalysisOracle);

  /**
   * @notice Constructor that sets the token to be airdropped and initializes the owner.
   * @param _token The address of the ERC20 token contract (UP).
   */
  constructor(
    address _token
  ) Ownable(msg.sender) EIP712("Unlock Protocol Airdrops", "1") {
    token = IERC20(_token);
  }

  function EIP712Name() public view returns (string memory) {
    return _EIP712Name();
  }

  function EIP712Version() public view returns (string memory) {
    return _EIP712Version();
  }

  /**
   * @notice Sets the Merkle root and Terms of Service (TOS) for a campaign.
   * @param campaignName The name/identifier of the campaign.
   * @param root The Merkle tree root corresponding to eligible entries.
   */
  function setMerkleRootForCampaign(
    string calldata campaignName,
    bytes32 root
  ) external onlyOwner {
    bytes32 campaignHash = keccak256(abi.encodePacked(campaignName));
    campaigns[campaignHash] = Campaign(campaignName, root);
    emit CampaignSet(campaignHash, root);
  }

  function getTosSignatureHash(
    address signer,
    string calldata campaignName,
    uint256 timestamp
  ) private view returns (bytes32) {
    bytes32 structHash = keccak256(
      abi.encode(
        keccak256(
          "TosSignature(address signer,string campaignName,uint256 timestamp)"
        ),
        signer,
        keccak256(abi.encodePacked(campaignName)),
        timestamp
      )
    );

    return _hashTypedDataV4(structHash);
  }

  function verifySignature(
    address signer,
    string calldata campaignName,
    uint256 timestamp,
    bytes calldata signature
  ) public view returns (bool) {
    bytes32 digest = getTosSignatureHash(signer, campaignName, timestamp);
    return digest.recover(signature) == signer;
  }

  /**
   * @notice Claims tokens for the airdrop if the recipient is eligible via the Merkle proof and has a signed TOS.
   * @param campaignName The campaign identifier.
   * @param timestamp The timestamp of the signature.
   * @param recipient The address for whom the tokens are being claimed.
   * @param amount The token amount to claim.
   * @param proof The proof bytes (multiple of 32 bytes) used for Merkle proof verification.
   * @param tosSignature The signature bytes (generated off-chain) of the campaign's TOS.
   */
  function claim(
    string calldata campaignName,
    uint256 timestamp,
    address recipient,
    uint256 amount,
    bytes32[] memory proof,
    bytes calldata tosSignature
  ) external {
    bytes32 campaignHash = keccak256(abi.encodePacked(campaignName));

    // Blocked users are not allowed to claim tokens.
    if (isBlocked(recipient)) revert UserBlocked(recipient);

    Campaign storage campaign = campaigns[campaignHash];
    if (campaign.merkleRoot == bytes32(0)) {
      revert MissingCampaign(campaignHash);
    }

    // Ensure the TOS has been signed. The stored hash must be non-zero.
    if (!verifySignature(recipient, campaignName, timestamp, tosSignature)) {
      revert WrongSigner(campaignHash, recipient);
    }

    // Compute the Merkle tree leaf.
    bytes32 leaf = keccak256(
      bytes.concat(keccak256(abi.encode(recipient, amount)))
    );

    // Prevent double-claiming; check that no hash is stored yet.
    if (claimedLeafs[campaignHash][leaf] != 0)
      revert AlreadyClaimed(campaignHash, recipient, amount, proof);

    // Verify the Merkle proof.
    bool valid = MerkleProof.verify(proof, campaign.merkleRoot, leaf);
    if (!valid) {
      revert InvalidProof(campaignHash, recipient, amount, proof);
    }

    // Record the claim with the leaf hash itself
    claimedLeafs[campaignHash][leaf] = block.timestamp;

    // Transfer tokens to the recipient
    token.transfer(recipient, amount);
    emit TokensClaimed(campaignHash, recipient, amount);
  }

  /**
   * @notice Adds an address to the blocklist.
   * @param user The address to be added to the blocklist.
   */
  function addToBlocklist(address user) external onlyOwner {
    blocklist[user] = true;
    emit AddedToBlockList(user);
  }

  /**
   * @notice Removes an address from the blocklist.
   * @param user The address to be removed from the blocklist.
   */
  function removeFromBlocklist(address user) external onlyOwner {
    blocklist[user] = false;
    emit RemovedFromBlockList(user);
  }

  /**
   * @notice Sets the chainalysis oracle address. https://go.chainalysis.com/chainalysis-oracle-docs.html
   * @param _chainalysisOracle The address of the oracle
   */
  function setChainalysisOracle(address _chainalysisOracle) external onlyOwner {
    chainalysisOracle = _chainalysisOracle;
    emit ChainalysisOracleSet(_chainalysisOracle);
  }

  /**
   * @notice Check if the user is blocked or on the sanctions list.
   * @param user The address to check
   */
  function isBlocked(address user) public view returns (bool) {
    return
      blocklist[user] || SanctionsList(chainalysisOracle).isSanctioned(user);
  }
}
