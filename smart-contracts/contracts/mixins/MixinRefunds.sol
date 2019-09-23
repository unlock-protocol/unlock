pragma solidity 0.5.11;

import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/cryptography/ECDSA.sol';
import './MixinKeys.sol';
import './MixinLockCore.sol';
import './MixinFunds.sol';
import './MixinEventHooks.sol';


contract MixinRefunds is
  Ownable,
  MixinFunds,
  MixinLockCore,
  MixinKeys,
  MixinEventHooks
{
  using SafeMath for uint;

  // CancelAndRefund will return funds based on time remaining minus this penalty.
  // This is calculated as `proRatedRefund * refundPenaltyNumerator / refundPenaltyDenominator`.
  uint public refundPenaltyNumerator = 1;
  uint public refundPenaltyDenominator = 10;

  uint public freeTrialLength;

  // Stores a nonce per user to use for signed messages
  mapping(address => uint) public keyOwnerToNonce;

  event CancelKey(
    uint indexed tokenId,
    address indexed owner,
    address indexed sendTo,
    uint refund
  );

  event RefundPenaltyChanged(
    uint freeTrialLength,
    uint refundPenaltyNumerator,
    uint refundPenaltyDenominator
  );

  /**
   * @dev Invoked by the lock owner to destroy the user's ket and perform a refund and cancellation
   * of the key
   */
  function fullRefund(address _keyOwner, uint amount)
    external
    onlyOwner
    hasValidKey(_keyOwner)
  {
    _cancelAndRefund(_keyOwner, amount);
  }

  /**
   * @dev Destroys the user's key and sends a refund based on the amount of time remaining.
   */
  function cancelAndRefund()
    external
  {
    uint refund = _getCancelAndRefundValue(msg.sender);

    _cancelAndRefund(msg.sender, refund);
  }

  /**
   * @dev Cancels a key owned by a different user and sends the funds to the msg.sender.
   * @param _keyOwner this user's key will be canceled
   * @param _signature getCancelAndRefundApprovalHash signed by the _keyOwner
   */
  function cancelAndRefundFor(
    address _keyOwner,
    bytes calldata _signature
  ) external
  {
    require(
      ECDSA.recover(
        ECDSA.toEthSignedMessageHash(
          getCancelAndRefundApprovalHash(_keyOwner, msg.sender)
        ),
        _signature
      ) == _keyOwner, 'INVALID_SIGNATURE'
    );

    keyOwnerToNonce[_keyOwner]++;
    uint refund = _getCancelAndRefundValue(_keyOwner);

    _cancelAndRefund(_keyOwner, refund);
  }

  /**
   * @dev Increments the current nonce for the msg.sender.
   * This can be used to invalidate a previously signed message.
   */
  function invalidateApprovalToCancelKey(
  ) external
  {
    keyOwnerToNonce[msg.sender]++;
  }

  /**
   * Allow the owner to change the refund penalty.
   */
  function updateRefundPenalty(
    uint _freeTrialLength,
    uint _refundPenaltyNumerator,
    uint _refundPenaltyDenominator
  )
    external
    onlyOwner
  {
    require(_refundPenaltyDenominator != 0, 'INVALID_RATE');

    emit RefundPenaltyChanged(
      _freeTrialLength,
      _refundPenaltyNumerator,
      _refundPenaltyDenominator
    );

    freeTrialLength = _freeTrialLength;
    refundPenaltyNumerator = _refundPenaltyNumerator;
    refundPenaltyDenominator = _refundPenaltyDenominator;
  }

  /**
   * @dev Determines how much of a refund a key owner would receive if they issued
   * a cancelAndRefund block.timestamp.
   * Note that due to the time required to mine a tx, the actual refund amount will be lower
   * than what the user reads from this call.
   */
  function getCancelAndRefundValueFor(
    address _owner
  )
    external view
    returns (uint refund)
  {
    return _getCancelAndRefundValue(_owner);
  }

  /**
   * @dev returns the hash to sign in order to allow another user to cancel on your behalf.
   */
  function getCancelAndRefundApprovalHash(
    address _keyOwner,
    address _txSender
  ) public view
    returns (bytes32 approvalHash)
  {
    return keccak256(
      abi.encodePacked(
        // Approval is specific to this Lock
        address(this),
        // Approval enables only one cancel call
        keyOwnerToNonce[_keyOwner],
        // Approval allows only one account to broadcast the tx
        _txSender
      )
    );
  }

  /**
   * @dev cancels the key for the given keyOwner and sends the refund to the msg.sender.
   */
  function _cancelAndRefund(
    address _keyOwner,
    uint refund
  ) internal
  {
    Key storage key = keyByOwner[_keyOwner];

    emit CancelKey(key.tokenId, _keyOwner, msg.sender, refund);
    // expirationTimestamp is a proxy for hasKey, setting this to `block.timestamp` instead
    // of 0 so that we can still differentiate hasKey from hasValidKey.
    key.expirationTimestamp = block.timestamp;

    if (refund > 0) {
      // Security: doing this last to avoid re-entrancy concerns
      _transfer(tokenAddress, _keyOwner, refund);
    }

    _onKeyCancel(_keyOwner, refund);
  }

  /**
   * @dev Determines how much of a refund a key owner would receive if they issued
   * a cancelAndRefund now.
   * @param _owner The owner of the key check the refund value for.
   */
  function _getCancelAndRefundValue(
    address _owner
  )
    private view
    hasValidKey(_owner)
    returns (uint refund)
  {
    Key storage key = keyByOwner[_owner];
    // Math: safeSub is not required since `hasValidKey` confirms timeRemaining is positive
    uint timeRemaining = key.expirationTimestamp - block.timestamp;
    if(timeRemaining + freeTrialLength >= expirationDuration) {
      refund = keyPrice;
    } else {
      // Math: using safeMul in case keyPrice or timeRemaining is very large
      refund = keyPrice.mul(timeRemaining) / expirationDuration;
    }

    // Apply the penalty if this is not a free trial
    if(freeTrialLength == 0 || timeRemaining + freeTrialLength < expirationDuration)
    {
      uint penalty = keyPrice.mul(refundPenaltyNumerator) / refundPenaltyDenominator;
      if (refund > penalty) {
        // Math: safeSub is not required since the if confirms this won't underflow
        refund -= penalty;
      } else {
        refund = 0;
      }
    }
  }
}
