pragma solidity 0.4.25;

import './MixinDisableAndDestroy.sol';
import './MixinKeys.sol';
import './MixinLockCore.sol';
import '../interfaces/IUnlock.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';


/**
 * @title Mixin for the purchase-related functions.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinPurchase is
  MixinDisableAndDestroy,
  MixinKeys,
  MixinLockCore
{
  using SafeMath for uint;

  /**
  * @dev Purchase function, public version, with no referrer.
  * @param _recipient address of the recipient of the purchased key
  * @param _data optional marker for the key
  */
  function purchaseFor(
    address _recipient,
    bytes _data
  )
    external
    payable
    onlyIfAlive
  {
    return _purchaseFor(_recipient, address(0), _data);
  }

  /**
  * @dev Purchase function, public version, with referrer.
  * @param _recipient address of the recipient of the purchased key
  * @param _referrer address of the user making the referral
  * @param _data optional marker for the key
  */
  function purchaseForFrom(
    address _recipient,
    address _referrer,
    bytes _data
  )
    external
    payable
    onlyIfAlive
    hasValidKey(_referrer)
  {
    return _purchaseFor(_recipient, _referrer, _data);
  }

  /**
  * @dev Purchase function: this lets a user purchase a key from the lock for another user
  * @param _recipient address of the recipient of the purchased key
  * @param _data optional marker for the key
  * This will fail if
  *  - the keyReleaseMechanism is private
  *  - the keyReleaseMechanism is Approved and the recipient has not been previously approved
  *  - the amount value is smaller than the price
  *  - the recipient already owns a key
  * TODO: next version of solidity will allow for message to be added to require.
  */
  function _purchaseFor(
    address _recipient,
    address _referrer,
    bytes memory _data
  )
    private
    notSoldOut()
  { // solhint-disable-line function-max-lines
    require(_recipient != address(0), 'INVALID_ADDRESS');

    // Let's get the actual price for the key from the Unlock smart contract
    IUnlock unlock = IUnlock(unlockProtocol);
    uint discount;
    uint tokens;
    uint inMemoryKeyPrice = keyPrice;
    (discount, tokens) = unlock.computeAvailableDiscountFor(_recipient, inMemoryKeyPrice);
    uint netPrice = inMemoryKeyPrice;
    if (discount > inMemoryKeyPrice) {
      netPrice = 0;
    } else {
      // SafeSub not required as the if statement already confirmed `inMemoryKeyPrice - discount` cannot underflow
      netPrice = inMemoryKeyPrice - discount;
    }

    // We explicitly allow for greater amounts to allow 'donations' or partial refunds after
    // discounts (TODO implement partial refunds)
    require(msg.value >= netPrice, 'NOT_ENOUGH_FUNDS');
    // TODO: If there is more than the required price, then let's return whatever is extra
    // extra (CAREFUL: re-entrancy!)

    // Assign the key
    Key storage toKey = _getKeyFor(_recipient);
    uint previousExpiration = toKey.expirationTimestamp;
    if (previousExpiration < block.timestamp) {
      if (previousExpiration == 0) {
        // This is a brand new owner, else an owner of an expired key buying an extension.
        // We increment the tokenId counter
        numberOfKeysSold++;
        _addNewOwner(_recipient);
        // We register the owner of the new tokenID
        _setKeyOwner(numberOfKeysSold, _recipient);
        // we assign the incremented `numberOfKeysSold` as the tokenId for the new key
        toKey.tokenId = numberOfKeysSold;
      }
      // SafeAdd is not required here since expirationDuration is capped to a tiny value
      // (relative to the size of a uint)
      toKey.expirationTimestamp = block.timestamp + expirationDuration;
    } else {
      // This is an existing owner trying to extend their key
      toKey.expirationTimestamp = previousExpiration.add(expirationDuration);
    }
    // Overwite data in all cases
    toKey.data = _data;

    if (discount > 0) {
      unlock.recordConsumedDiscount(discount, tokens);
    }

    unlock.recordKeyPurchase(netPrice, _referrer);

    // trigger event
    emit Transfer(
      address(0), // This is a creation.
      _recipient,
      numberOfKeysSold
    );
  }
}