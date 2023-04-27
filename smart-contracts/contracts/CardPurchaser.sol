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
  error INSUFFICIENT_AUTHORIZATION();
  error TOO_LATE();
  error PURCHASER_DOES_NOT_MATCH();

  // Unlock address on current chain
  address public unlockAddress;

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
   */
  constructor(address _unlockAddress) EIP712("Card Purchaser", "1") Ownable() {
    unlockAddress = _unlockAddress;
  }

  /**
   * The function that withdraws the USDC tokens from the user, and then uses them to perform a purchase
   */
  function purchase(
    address usdc,
    ApprovalMessage memory approvalMessage,
    uint8 approvalSignatureV,
    bytes32 approvalSignatureR,
    bytes32 approvalSignatureS,
    PurchaseMessage memory purchaseMessage,
    uint8 purchaseSignatureV,
    bytes32 purchaseSignatureR,
    bytes32 purchaseSignatureS,
    bytes memory callData
  ) public returns (bytes memory) {
    // This works only for locks
    (bool lockExists, , ) = IUnlock(unlockAddress).locks(purchaseMessage.lock);
    if (!lockExists) {
      revert MISSING_LOCK();
    }

    if (purchaseMessage.expiration < block.timestamp) {
      revert TOO_LATE();
    }

    uint balanceBefore = IUSDC(usdc).balanceOf(address(this));

    // Check the signer of purchaseMessage is approvalMessage.from,
    // this means that whoever signed the purchase message also matches the approval
    if (purchaseMessage.sender != approvalMessage.from) {
      revert PURCHASER_DOES_NOT_MATCH();
    }

    // Get the tokens from the user
    IUSDC(usdc).transferWithAuthorization(
      approvalMessage.from,
      address(this), // We explicitly don't use approvalMessage.to, just in case it was compromised!
      approvalMessage.value,
      approvalMessage.validAfter,
      approvalMessage.validBefore,
      approvalMessage.nonce,
      approvalSignatureV,
      approvalSignatureR,
      approvalSignatureS
    );

    // Approve the lock to spend all of the USDC (but it should spend less!)
    IUSDC(usdc).approve(purchaseMessage.lock, approvalMessage.value);

    // Finally: call the lock
    (bool lockCallSuccess, bytes memory returnData) = purchaseMessage.lock.call{
      value: 0
    }(callData);

    // Reset approval
    IUSDC(usdc).approve(purchaseMessage.lock, 0);

    if (lockCallSuccess == false) {
      revert LOCK_CALL_FAILED();
    }

    uint balanceAfter = IUSDC(usdc).balanceOf(address(this));
    if (balanceAfter <= balanceBefore) {
      revert INSUFFICIENT_AUTHORIZATION();
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
}
