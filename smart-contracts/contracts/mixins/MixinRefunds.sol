// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './MixinKeys.sol';
import './MixinLockCore.sol';
import './MixinRoles.sol';
import './MixinFunds.sol';
import './MixinPurchase.sol';

contract MixinRefunds is
  MixinRoles,
  MixinFunds,
  MixinLockCore,
  MixinKeys,
  MixinPurchase
{
  // CancelAndRefund will return funds based on time remaining minus this penalty.
  // This is calculated as `proRatedRefund * refundPenaltyBasisPoints / BASIS_POINTS_DEN`.
  uint public refundPenaltyBasisPoints;

  uint public freeTrialLength;

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
   * @dev Invoked by the lock owner to destroy the user's key and perform a refund and cancellation
   * of the key
   * @param _tokenId The id of the key to expire
   * @param _amount The amount to refund
   */
  function expireAndRefundFor(
    uint _tokenId,
    uint _amount
  ) external {
    _isKey(_tokenId);
    _isValidKey(_tokenId);
    _onlyLockManager();
    _cancelAndRefund(_tokenId, _amount);
  }

  /**
   * @dev Destroys the key and sends a refund based on the amount of time remaining.
   * @param _tokenId The id of the key to cancel.
   */
  function cancelAndRefund(uint _tokenId)
    external
  {
    _isKey(_tokenId);
    _isValidKey(_tokenId);
    _onlyKeyManagerOrApproved(_tokenId);
    uint refund = getCancelAndRefundValue(_tokenId);
    _cancelAndRefund(_tokenId, refund);
  }

  /**
   * Allow the owner to change the refund penalty.
   */
  function updateRefundPenalty(
    uint _freeTrialLength,
    uint _refundPenaltyBasisPoints
  ) external {
    _onlyLockManager();
    emit RefundPenaltyChanged(
      _freeTrialLength,
      _refundPenaltyBasisPoints
    );

    freeTrialLength = _freeTrialLength;
    refundPenaltyBasisPoints = _refundPenaltyBasisPoints;
  }

  /**
   * @dev cancels the key for the given keyOwner and sends the refund to the msg.sender.
   * @notice this deletes ownership info and expire the key, but doesnt 'burn' it
   */
  function _cancelAndRefund(
    uint _tokenId,
    uint refund
  ) internal
  {
    address payable keyOwner = payable(ownerOf(_tokenId));
    
    // delete ownership info and expire the key
    _cancelKey(_tokenId);
    
    // emit event
    emit CancelKey(_tokenId, keyOwner, msg.sender, refund);
    
    if (refund > 0) {
      _transfer(tokenAddress, keyOwner, refund);
    }

    // make future reccuring transactions impossible
    _originalDurations[_tokenId] = 0;
    
    // inform the hook if there is one registered
    if(address(onKeyCancelHook) != address(0))
    {
      onKeyCancelHook.onKeyCancel(msg.sender, keyOwner, refund);
    }
  }

  /**
   * @dev Determines how much of a refund a key would be worth if a cancelAndRefund
   * is issued now.
   * @param _tokenId the key to check the refund value for.
   * @notice due to the time required to mine a tx, the actual refund amount will be lower
   * than what the user reads from this call.
   */
  function getCancelAndRefundValue(
    uint _tokenId
  )
    public view
    returns (uint refund)
  {
    _isValidKey(_tokenId);

    // return entire purchased price if key is non-expiring
    if(expirationDuration == type(uint).max) {
      return keyPrice;
    }

    // substract free trial value
    uint timeRemaining = keyExpirationTimestampFor(_tokenId) - block.timestamp;
    if(timeRemaining + freeTrialLength >= expirationDuration) {
      refund = keyPrice;
    } else {
      refund = keyPrice * timeRemaining / expirationDuration;
    }

    // Apply the penalty if this is not a free trial
    if(freeTrialLength == 0 || timeRemaining + freeTrialLength < expirationDuration)
    {
      uint penalty = keyPrice * refundPenaltyBasisPoints / BASIS_POINTS_DEN;
      if (refund > penalty) {
        refund -= penalty;
      } else {
        refund = 0;
      }
    }
  }

  uint256[1000] private __safe_upgrade_gap;
}
