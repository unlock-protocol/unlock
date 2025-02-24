/* solhint-disable no-inline-assembly */

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Custom errors
error NOT_AUTHORIZED();
error NOT_OWNER();
error ALREADY_CLAIMED();
error USER_BLOCKED();

/**
 * @notice Interface for the Airdrops contract that handles campaign management and token claims
 * @dev Defines functions for setting campaign parameters, signing TOS, and claiming tokens
 */
interface IAirdrops {
  function setMerkleRootForCampaign(
    string calldata campaignName,
    string calldata tos,
    bytes32 root
  ) external;
  function signTos(
    string calldata campaignName,
    address recipient,
    bytes calldata signature
  ) external;
  function claim(
    string calldata campaignName,
    address recipient,
    uint256 amount,
    bytes calldata proof
  ) external;
}

/**
 * @title Airdrops
 * @notice This contract handles airdrop claims protected by a Merkle tree and TOS signature verification.
 * The contract allows only those who have signed the campaign's Terms of Service (TOS) to claim tokens.
 * The owner sets up campaigns with a TOS and a corresponding Merkle root representing eligible entries.
 */
contract Airdrops is IAirdrops {
  /// @notice Structure representing a campaign's TOS hash and its corresponding Merkle tree root.
  struct Campaign {
    bytes32 tosHash;
    bytes32 merkleRoot;
  }

  /// @notice The ERC20 token to be airdropped (UP)
  IERC20 public immutable token;

  /// @notice Owner for administrative functions
  address public owner;

  /// @notice Mapping from campaign name to campaign details.
  mapping(string => Campaign) public campaigns;

  /// @notice Mapping from campaign name to addresses that have signed the TOS.
  mapping(string => mapping(address => bytes32)) public signedTos;

  /// @notice Mapping of Merkle tree leaves that have been claimed.
  mapping(bytes32 => bytes32) public claimedLeafs;

  /// @notice Mapping of addresses that are blocklisted.
  mapping(address => bool) public blocklist;

  /// @notice Emitted when a campaign is set.
  event CampaignSet(string indexed campaignName, bytes32 merkleRoot);
  /// @notice Emitted when a recipient signs the TOS.
  event TosSigned(
    string indexed campaignName,
    address indexed recipient,
    bytes32 signatureHash
  );
  /// @notice Emitted when tokens are claimed.
  event TokensClaimed(
    string indexed campaignName,
    address indexed recipient,
    uint256 amount
  );

  /**
   * @notice Constructor that sets the token to be airdropped and initializes the owner.
   * @param _token The address of the ERC20 token contract (UP).
   */
  constructor(address _token) {
    token = IERC20(_token);
    owner = msg.sender;
  }

  /**
   * @notice Modifier to restrict functions to the contract owner.
   */
  modifier onlyOwner() {
    if (msg.sender != owner) revert NOT_OWNER();
    _;
  }

  /**
   * @notice Sets the Merkle root and Terms of Service (TOS) for a campaign.
   * @param campaignName The name/identifier of the campaign.
   * @param tos The Terms of Service text for the campaign.
   * @param root The Merkle tree root corresponding to eligible entries.
   */
  function setMerkleRootForCampaign(
    string calldata campaignName,
    string calldata tos,
    bytes32 root
  ) external override onlyOwner {
    // Compute and store only the Ethereum Signed Message hash of the TOS.
    bytes32 tosHash = MessageHashUtils.toEthSignedMessageHash(
      keccak256(bytes(tos))
    );
    campaigns[campaignName] = Campaign(tosHash, root);
    emit CampaignSet(campaignName, root);
  }

  /**
   * @notice Signs the Terms of Service for a given campaign.
   *
   * The signature must be produced off-chain, signing the Ethereum Signed Message hash of the campaign's TOS.
   *
   * @param campaignName The campaign identifier.
   * @param recipient The address that is signing the TOS.
   * @param signature The signature bytes (generated off-chain) of the hash of the campaign's TOS.
   */
  function signTos(
    string calldata campaignName,
    address recipient,
    bytes calldata signature
  ) external override {
    Campaign storage campaign = campaigns[campaignName];
    if (campaign.tosHash == bytes32(0)) revert NOT_AUTHORIZED(); // Campaign does not exist.

    // Use stored message hash from campaign.
    bytes32 messageHash = campaign.tosHash;

    // Recover the signer from the provided signature.
    address recovered = ECDSA.recover(messageHash, signature);
    if (recovered != recipient) {
      revert NOT_AUTHORIZED();
    }

    // Store a hash of recipient and campaign name to mark as signed
    bytes32 tosSignatureHash = keccak256(abi.encode(recipient, campaignName));
    signedTos[campaignName][recipient] = tosSignatureHash;
    emit TosSigned(campaignName, recipient, tosSignatureHash);
  }

  /**
   * @notice Claims tokens for the airdrop if the recipient is eligible via the Merkle proof and has a signed TOS.
   * @param campaignName The campaign identifier.
   * @param recipient The address for whom the tokens are being claimed.
   * @param amount The token amount to claim.
   * @param proof The concatenated proof bytes (multiple of 32 bytes) used for Merkle proof verification.
   */
  function claim(
    string calldata campaignName,
    address recipient,
    uint256 amount,
    bytes calldata proof
  ) external override {
    // Blocked users are not allowed to claim tokens.
    if (blocklist[recipient]) revert USER_BLOCKED();

    // Ensure the TOS has been signed. The stored hash must be non-zero.
    if (signedTos[campaignName][recipient] == bytes32(0))
      revert NOT_AUTHORIZED();

    Campaign storage campaign = campaigns[campaignName];
    if (campaign.merkleRoot == bytes32(0)) {
      revert NOT_AUTHORIZED();
    }

    // Compute the Merkle tree leaf.
    bytes32 leaf = keccak256(
      bytes.concat(keccak256(abi.encode(recipient, amount)))
    );

    // Prevent double-claiming; check that no hash is stored yet.
    if (claimedLeafs[leaf] != bytes32(0)) revert ALREADY_CLAIMED();

    // Verify the Merkle proof.
    bool valid = MerkleProof.verify(
      _bytesToBytes32Array(proof),
      campaign.merkleRoot,
      leaf
    );
    if (!valid) {
      revert NOT_AUTHORIZED();
    }

    // Record the claim with the leaf hash itself
    claimedLeafs[leaf] = leaf;

    // Transfer tokens to the recipient
    token.transfer(recipient, amount);
    emit TokensClaimed(campaignName, recipient, amount);
  }

  /**
   * @notice Adds an address to the blocklist.
   * @param user The address to be added to the blocklist.
   */
  function addToBlocklist(address user) external onlyOwner {
    blocklist[user] = true;
  }

  /**
   * @notice Removes an address from the blocklist.
   * @param user The address to be removed from the blocklist.
   */
  function removeFromBlocklist(address user) external onlyOwner {
    blocklist[user] = false;
  }

  /**
   * @notice Internal helper to convert a bytes blob into an array of bytes32
   * @param data The concatenated bytes (proof) to be split.
   * @return An array of bytes32 extracted from the input data.
   */
  function _bytesToBytes32Array(
    bytes memory data
  ) internal pure returns (bytes32[] memory) {
    // Find 32 bytes segments nb
    uint256 dataNb = data.length / 32;
    // Create an array of dataNb elements
    bytes32[] memory dataList = new bytes32[](dataNb);
    // Start array index at 0
    uint256 index = 0;
    // Loop all 32 bytes segments
    for (uint256 i = 32; i <= data.length; i = i + 32) {
      bytes32 temp;
      // Get 32 bytes from data
      assembly {
        temp := mload(add(data, i))
      }
      // Add extracted 32 bytes to list
      dataList[index] = temp;
      index++;
    }
    // Return data list
    return (dataList);
  }
}
