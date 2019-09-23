pragma solidity 0.5.11;

import './MixinDisableAndDestroy.sol';
import './MixinKeys.sol';
import './MixinLockCore.sol';
import 'openzeppelin-eth/contracts/math/SafeMath.sol';
import './MixinFunds.sol';
import './MixinEventHooks.sol';


/**
 * @title Mixin for the purchase-related functions.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinPurchase is
  MixinFunds,
  MixinDisableAndDestroy,
  MixinLockCore,
  MixinKeys,
  MixinEventHooks
{
  using SafeMath for uint;

  /**
  * @dev Purchase function
  * @param _recipient address of the recipient of the purchased key
  * @param _referrer address of the user making the referral
  * @param _data arbitrary data populated by the front-end which initiated the sale
  */
  function purchase(
    address _recipient,
    address _referrer,
    bytes calldata _data
  ) external payable
    onlyIfAlive
    notSoldOut
  {
    require(_recipient != address(0), 'INVALID_ADDRESS');

    // Let's get the actual price for the key from the Unlock smart contract
    uint discount;
    uint tokens;
    uint inMemoryKeyPrice = keyPrice;
    (discount, tokens) = unlockProtocol.computeAvailableDiscountFor(_recipient, inMemoryKeyPrice);

    if (discount > inMemoryKeyPrice) {
      inMemoryKeyPrice = 0;
    } else {
      // SafeSub not required as the if statement already confirmed `inMemoryKeyPrice - discount` cannot underflow
      inMemoryKeyPrice -= discount;
    }

    // Assign the key
    Key storage toKey = _getKeyFor(_recipient);

    if (toKey.tokenId == 0) {
      // Assign a new tokenId (if a new owner or previously transfered)
      _assignNewTokenId(toKey);
      _recordOwner(_recipient, toKey.tokenId);
    }

    if (toKey.expirationTimestamp >= block.timestamp) {
      // This is an existing owner trying to extend their key
      toKey.expirationTimestamp = toKey.expirationTimestamp.add(expirationDuration);
    } else {
      // SafeAdd is not required here since expirationDuration is capped to a tiny value
      // (relative to the size of a uint)
      toKey.expirationTimestamp = block.timestamp + expirationDuration;
    }

    if (discount > 0) {
      unlockProtocol.recordConsumedDiscount(discount, tokens);
    }

    unlockProtocol.recordKeyPurchase(inMemoryKeyPrice, getHasValidKey(_referrer) ? _referrer : address(0));

    // trigger event
    emit Transfer(
      address(0), // This is a creation.
      _recipient,
      toKey.tokenId
    );

    // We explicitly allow for greater amounts of ETH to allow 'donations'
    // Security: after state changes to minimize risk of re-entrancy
    uint pricePaid = _chargeAtLeast(inMemoryKeyPrice);

    // Security: last line to minimize risk of re-entrancy
    _onKeySold(_recipient, _referrer, pricePaid, _data);
  }
}
