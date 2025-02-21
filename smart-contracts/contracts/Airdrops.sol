// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Airdrops
 * @notice This contract handles airdrop claims protected by a Merkle tree and TOS signature verification.
 * The contract allows only those who have signed the campaign's Terms of Service (TOS) to claim tokens.
 * The owner sets up campaigns with a TOS and a corresponding Merkle root representing eligible entries.
 */
contract Airdrops {
  /// @notice The ERC20 token to be airdropped (UP)
  IERC20 public token;

  /// @notice Owner for administrative functions
  address public owner;

  /// @notice Structure representing a campaign's Terms of Service and its corresponding Merkle tree root.
  struct Campaign {
    string tos;
    bytes32 merkleRoot;
  }

  /// @notice Mapping from campaign name to campaign details.
  mapping(string => Campaign) public campaigns;

  /// @notice Mapping from campaign name to addresses that have signed the TOS.
  mapping(string => mapping(address => bool)) public signedTos;

  /// @notice Mapping of Merkle tree leaves that have been claimed to prevent double claiming.
  mapping(bytes32 => bool) public claimedLeafs;

  /// @notice Emitted when a campaign is set.
  event CampaignSet(string indexed campaignName, bytes32 merkleRoot);
  /// @notice Emitted when a recipient signs the TOS.
  event TosSigned(string indexed campaignName, address indexed recipient);
  /// @notice Emitted when tokens are claimed.
  event TokensClaimed(string indexed campaignName, address indexed recipient, uint256 amount);

  /// @notice Custom error for unauthorized actions.
  error NOT_AUTHORIZED();

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
    require(msg.sender == owner, "Only owner");
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
  ) external onlyOwner {
    campaigns[campaignName] = Campaign(tos, root);
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
  ) external {
    // Ensure the caller is the recipient signing the TOS.
    require(msg.sender == recipient, "Caller must be recipient");

    Campaign storage campaign = campaigns[campaignName];
    require(bytes(campaign.tos).length != 0, "Campaign does not exist");

    // Create the Ethereum Signed Message hash from the campaign's TOS.
    bytes32 messageHash = MessageHashUtils.toEthSignedMessageHash(keccak256(bytes(campaign.tos)));
    // Recover the signer from the provided signature.
    address recovered = ECDSA.recover(messageHash, signature);
    if (recovered != recipient) {
      revert NOT_AUTHORIZED();
    }
    signedTos[campaignName][recipient] = true;
    emit TosSigned(campaignName, recipient);
  }

  /**
   * @notice Claims tokens for the airdrop if the recipient is eligible via the Merkle proof and has signed the TOS.
   *
   * It computes the leaf from the recipient address and token amount using the same logic as the backend:
   * 
   * \[
   * \text{leaf} = \mathtt{keccak256( bytes.concat( keccak256( abi.encode( recipient, amount ) ) ) )}
   * \]
   *
   * @param campaignName The campaign identifier.
   * @param recipient The address claiming tokens. (Must be equal to msg.sender.)
   * @param amount The token amount to claim.
   * @param proof The concatenated proof bytes (multiple of 32 bytes) used for Merkle proof verification.
   */
  function claim(
    string calldata campaignName,
    address recipient,
    uint256 amount,
    bytes calldata proof
  ) external {
    // Ensure that the caller is the recipient.
    require(msg.sender == recipient, "Caller must be recipient");
    // Check that the recipient has signed the TOS for the campaign.
    require(signedTos[campaignName][recipient], "TOS not signed");

    Campaign storage campaign = campaigns[campaignName];
    if (campaign.merkleRoot == bytes32(0)) {
      revert NOT_AUTHORIZED();
    }

    // Compute the Merkle tree leaf.
    bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(recipient, amount))));
    
    // Prevent double-claiming.
    require(!claimedLeafs[leaf], "Already claimed");

    // Verify the Merkle proof.
    bool valid = MerkleProof.verify(_bytesToBytes32Array(proof), campaign.merkleRoot, leaf);
    if (!valid) {
      revert NOT_AUTHORIZED();
    }
    claimedLeafs[leaf] = true;

    // Transfer tokens to the recipient.
    require(token.transfer(recipient, amount), "Token transfer failed");
    emit TokensClaimed(campaignName, recipient, amount);
  }

  /**
   * @notice Internal helper to convert a bytes blob into an array of bytes32.
   * @param data The concatenated bytes (proof) to be split.
   * @return An array of bytes32 extracted from the input data.
   */
  function _bytesToBytes32Array(
    bytes memory data
  ) internal pure returns (bytes32[] memory) {
    require(data.length % 32 == 0, "Invalid proof length");
    uint256 length = data.length / 32;
    bytes32[] memory dataList = new bytes32[](length);
    for (uint256 i = 0; i < length; i++) {
      bytes32 current;
      assembly {
        current := mload(add(data, mul(add(i, 1), 32)))
      }
      dataList[i] = current;
    }
    return dataList;
  }
}
