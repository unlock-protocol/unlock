pragma solidity 0.5.14;

import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol';
import './MixinSignatures.sol';
import './MixinKeys.sol';
import './MixinLockCore.sol';
import './MixinFunds.sol';
import './MixinEventHooks.sol';


contract MixinRefunds is
  Ownable,
  MixinSignatures,
  MixinFunds,
  MixinLockCore,
  MixinKeys,
  MixinEventHooks
{
  using SafeMath for uint;

  // CancelAndRefund will return funds based on time remaining minus this penalty.
  // This is calculated as `proRatedRefund * refundPenaltyBasisPoints / BASIS_POINTS_DEN`.
  uint public refundPenaltyBasisPoints;

  uint public freeTrialLength;

  /// @notice The typehash per the EIP-712 standard
  /// @dev This can be computed in JS instead of read from the contract
  bytes32 public constant CANCEL_TYPEHASH = keccak256('cancelAndRefundFor(address _keyOwner)');

  event CancelKey(
    uint indexed tokenId,
    address indexed owner,
    address indexed sendTo,
    uint refund
  );

  event RefundPenaltyChanged(
    uint freeTrialLength,
    uint refundPenaltyBasisPoints
  );

  function _initializeMixinRefunds() internal
  {
    // default to 10%
    refundPenaltyBasisPoints = 1000;
  }

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
   * @param _v _r _s getCancelAndRefundApprovalHash signed by the _keyOwner
   */
  function cancelAndRefundFor(
    address _keyOwner,
    uint8 _v,
    bytes32 _r,
    bytes32 _s
  ) external
    consumeOffchainApproval(
      getCancelAndRefundApprovalHash(_keyOwner, msg.sender),
      _keyOwner,
      _v,
      _r,
      _s
    )
  {
    uint refund = _getCancelAndRefundValue(_keyOwner);
    _cancelAndRefund(_keyOwner, refund);
  }

  /**
   * Allow the owner to change the refund penalty.
   */
  function updateRefundPenalty(
    uint _freeTrialLength,
    uint _refundPenaltyBasisPoints
  )
    external
    onlyOwner
  {
    emit RefundPenaltyChanged(
      _freeTrialLength,
      _refundPenaltyBasisPoints
    );

    freeTrialLength = _freeTrialLength;
    refundPenaltyBasisPoints = _refundPenaltyBasisPoints;
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
   * @notice returns the hash to sign in order to allow another user to cancel on your behalf.
   * @dev this can be computed in JS instead of read from the contract.
   * @param _keyOwner The key owner's address (also the message signer)
   * @param _txSender The address cancelling cancel on behalf of the keyOwner
   * @return approvalHash The hash to sign
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
        // The specific function the signer is approving
        CANCEL_TYPEHASH,
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
      uint penalty = keyPrice.mul(refundPenaltyBasisPoints) / BASIS_POINTS_DEN;
      if (refund > penalty) {
        // Math: safeSub is not required since the if confirms this won't underflow
        refund -= penalty;
      } else {
        refund = 0;
      }
    }
  }
}
