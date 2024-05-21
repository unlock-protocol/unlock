/* solhint-disable no-inline-assembly */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "./interfaces/IUSDC.sol";
import "./interfaces/IPublicLock.sol";
import "./interfaces/IUnlock.sol";

/// @custom:security-contact hello@unlock-protocol.com
contract CardPurchaser is Ownable, EIP712 {
  error WITHDRAW_FAILED();
  error MISSING_LOCK();
  error LOCK_CALL_FAILED();
  error TOO_MUCH_SPENT();
  error TOO_LATE();
  error PURCHASER_DOES_NOT_MATCH_PAYER();
  error SIGNER_DOES_NOT_MATCH();

  // Unlock address on current chain
  address public unlockAddress;

  // Address of USDC contract
  address public usdc;

  // Name of contract (OZ's EIP712 does not expose it)
  string public name;

  // VErsion of contract (OZ's EIP712 does not expose it)
  string public version;

  struct ApprovalMessage {
    address from;
    address to;
    uint256 value;
    uint256 validAfter;
    uint256 validBefore;
    bytes32 nonce;
  }

  struct PurchaseMessage {
    address lock;
    address sender;
    uint256 expiration;
  }

  /**
   * Constructor
   * We double the `name` and `version` fields from EIP712 so we can query the contract to get them and OZ's Ownable does not expose them
   */
  constructor(
    address _owner,
    address _unlockAddress,
    address _usdc
  ) EIP712("Card Purchaser", "1") Ownable(_owner) {
    name = "Card Purchaser";
    version = "1";
    unlockAddress = _unlockAddress;
    usdc = _usdc;
  }

  /**
   * The function that withdraws the USDC tokens from the user,
   * and then uses them to perform a purchase
   */
  function purchase(
    ApprovalMessage memory approvalMessage,
    bytes memory approvalSignature,
    PurchaseMessage memory purchaseMessage,
    bytes memory purchaseSignature,
    bytes memory callData
  ) public returns (bytes memory) {
    // This works only for locks
    (bool lockExists, , ) = IUnlock(unlockAddress).locks(purchaseMessage.lock);
    if (!lockExists) {
      revert MISSING_LOCK();
    }

    // Check the purchase is not expired
    if (purchaseMessage.expiration < block.timestamp) {
      revert TOO_LATE();
    }

    // Check the purchaseMessage.sender is approvalMessage.from (purchaser is the spender)
    if (purchaseMessage.sender != approvalMessage.from) {
      revert PURCHASER_DOES_NOT_MATCH_PAYER();
    }

    // Check the signature on the purchase matches its sender
    bytes32 structHash = keccak256(
      abi.encode(
        keccak256("Purchase(address lock,address sender,uint256 expiration)"),
        purchaseMessage.lock,
        purchaseMessage.sender,
        purchaseMessage.expiration
      )
    );
    bytes32 hash = _hashTypedDataV4(structHash);
    address recovered = ECDSA.recover(hash, purchaseSignature);
    if (recovered != approvalMessage.from) {
      revert SIGNER_DOES_NOT_MATCH();
    }

    // Get the balance to make sure no extra token are spent!
    uint balanceBefore = IUSDC(usdc).balanceOf(address(this));

    // Get the tokens from the user
    transferTokens(approvalMessage, approvalSignature);

    // Approve the lock to spend all of the USDC (but it should spend less!)
    IUSDC(usdc).approve(purchaseMessage.lock, approvalMessage.value);

    // Finally: call the lock
    (bool lockCallSuccess, bytes memory returnData) = purchaseMessage.lock.call{
      value: 0
    }(callData);

    // Reset approval
    IUSDC(usdc).approve(purchaseMessage.lock, 0);

    // Bubble up any error
    if (lockCallSuccess == false) {
      // If there is return data, the call reverted without a reason or a custom error.
      if (returnData.length == 0) revert();
      assembly {
        // We use Yul's revert() to bubble up errors from the target contract.
        revert(add(32, returnData), mload(returnData))
      }
    }

    // Check that balance only increased!
    uint balanceAfter = IUSDC(usdc).balanceOf(address(this));
    if (balanceAfter < balanceBefore) {
      revert TOO_MUCH_SPENT();
    }

    return returnData;
  }

  /**
   * This is used to send remaining tokens back to the owner (collecting fees!)
   * @param tokenAddress the ERC20 contract address of the token to withdraw
   * or address(0) for native tokens (it should mostly be USDC, but could be anything else, just in case)
   * @param recipient the address that will receive the tokens
   * @param amount the amount of tokens to transfer
   */
  function withdraw(
    address tokenAddress,
    address recipient,
    uint amount
  ) public onlyOwner {
    if (tokenAddress != address(0)) {
      IUSDC(tokenAddress).transfer(recipient, amount);
    } else {
      (bool sent, ) = payable(recipient).call{value: amount}("");
      if (sent == false) {
        revert WITHDRAW_FAILED();
      }
    }
  }

  // Helper
  function splitSignature(
    bytes memory sig
  ) private pure returns (bytes32 r, bytes32 s, uint8 v) {
    require(sig.length == 65, "invalid signature length");

    assembly {
      /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

      // first 32 bytes, after the length prefix
      r := mload(add(sig, 32))
      // second 32 bytes
      s := mload(add(sig, 64))
      // final byte (first byte of the next 32 bytes)
      v := byte(0, mload(add(sig, 96)))
    }

    // implicitly return (r, s, v)
  }

  // Helper
  function transferTokens(
    ApprovalMessage memory approvalMessage,
    bytes memory approvalSignature
  ) private {
    (bytes32 ra, bytes32 sa, uint8 va) = splitSignature(approvalSignature);
    IUSDC(usdc).transferWithAuthorization(
      approvalMessage.from,
      address(this), // We explicitly don't use approvalMessage.to, just in case it was compromised!
      approvalMessage.value,
      approvalMessage.validAfter,
      approvalMessage.validBefore,
      approvalMessage.nonce,
      va,
      ra,
      sa
    );
  }
}
