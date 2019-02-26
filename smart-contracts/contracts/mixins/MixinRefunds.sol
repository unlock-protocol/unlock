pragma solidity 0.5.4;

import 'openzeppelin-eth/contracts/ownership/Ownable.sol';
import './MixinKeys.sol';
import './MixinLockCore.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';


contract MixinRefunds is
  Ownable,
  MixinKeys,
  MixinLockCore
{
  using SafeMath for uint;

  // CancelAndRefund will return funds based on time remaining minus this penalty.
  // This is a denominator, so 10 means 10% penalty and 20 means 5% penalty.
  uint public refundPenaltyDenominator;

  event CancelKey(
    uint indexed tokenId,
    address indexed owner,
    uint refund
  );

  event RefundPenaltyDenominatorChanged(
    uint oldPenaltyDenominator,
    uint refundPenaltyDenominator
  );

  constructor(
  ) internal
  {
    refundPenaltyDenominator = 10;
  }

  /**
   * @dev Destroys the user's key and sends a refund based on the amount of time remaining.
   */
  function cancelAndRefund()
    external
  {
    Key storage key = _getKeyFor(msg.sender);

    uint refund = _getCancelAndRefundValue(msg.sender);

    emit CancelKey(key.tokenId, msg.sender, refund);
    // expirationTimestamp is a proxy for hasKey, setting this to `block.timestamp` instead
    // of 0 so that we can still differentiate hasKey from hasValidKey.
    key.expirationTimestamp = block.timestamp;
    // Remove data as we don't need this any longer
    delete key.data;

    if (refund > 0) {
      // Security: doing this last to avoid re-entrancy concerns
      msg.sender.transfer(refund);
    }
  }

  /**
   * Allow the owner to change the refund penalty.
   */
  function updateRefundPenaltyDenominator(
    uint _refundPenaltyDenominator
  )
    external
    onlyOwner
  {
    emit RefundPenaltyDenominatorChanged(refundPenaltyDenominator, _refundPenaltyDenominator);
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
    external
    view
    returns (uint refund)
  {
    return _getCancelAndRefundValue(_owner);
  }

  /**
   * @dev Determines how much of a refund a key owner would receive if they issued
   * a cancelAndRefund now.
   * @param _owner The owner of the key check the refund value for.
   */
  function _getCancelAndRefundValue(
    address _owner
  )
    private
    view
    hasValidKey(_owner)
    returns (uint refund)
  {
    Key storage key = _getKeyFor(_owner);
    // Math: safeSub is not required since `hasValidKey` confirms timeRemaining is positive
    uint timeRemaining = key.expirationTimestamp - block.timestamp;
    // Math: using safeMul in case keyPrice or timeRemaining is very large
    refund = keyPrice.mul(timeRemaining) / expirationDuration;
    if (refundPenaltyDenominator > 0) {
      uint penalty = keyPrice / refundPenaltyDenominator;
      if (refund > penalty) {
        // Math: safeSub is not required since the if confirms this won't underflow
        refund -= penalty;
      } else {
        refund = 0;
      }
    }
  }
}