pragma solidity 0.5.9;

import 'openzeppelin-eth/contracts/ownership/Ownable.sol';
import './MixinDisableAndDestroy.sol';
import '../interfaces/IUnlock.sol';
import './MixinFunds.sol';


/**
 * @title Mixin for core lock data and functions.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinLockCore is
  Ownable,
  MixinFunds,
  MixinDisableAndDestroy
{
  event PriceChanged(
    uint oldKeyPrice,
    uint keyPrice
  );

  event Withdrawal(
    address indexed _sender,
    uint _amount
  );

  // Unlock Protocol address
  // TODO: should we make that private/internal?
  IUnlock public unlockProtocol;

  // Duration in seconds for which the keys are valid, after creation
  // should we take a smaller type use less gas?
  // TODO: add support for a timestamp instead of duration
  uint public expirationDuration;

  // price in wei of the next key
  // TODO: allow support for a keyPriceCalculator which could set prices dynamically
  uint public keyPrice;

  // Max number of keys sold if the keyReleaseMechanism is public
  uint public maxNumberOfKeys;

  // A count of how many new key purchases there have been
  uint public numberOfKeysSold;

  // Ensure that the Lock has not sold all of its keys.
  modifier notSoldOut() {
    require(maxNumberOfKeys > numberOfKeysSold, 'LOCK_SOLD_OUT');
    _;
  }

  constructor(
    uint _expirationDuration,
    uint _keyPrice,
    uint _maxNumberOfKeys
  ) internal
  {
    require(_expirationDuration <= 100 * 365 * 24 * 60 * 60, 'MAX_EXPIRATION_100_YEARS');
    unlockProtocol = IUnlock(msg.sender); // Make sure we link back to Unlock's smart contract.
    expirationDuration = _expirationDuration;
    keyPrice = _keyPrice;
    maxNumberOfKeys = _maxNumberOfKeys;
  }

  /**
   * @dev Called by owner to withdraw all funds from the lock.
   * TODO: consider allowing anybody to trigger this as long as it goes to owner anyway?
   */
  function withdraw()
    external
    onlyOwner
  {
    uint balance = _getBalance(address(this));
    require(balance > 0, 'NOT_ENOUGH_FUNDS');
    // Security: re-entrancy not a risk as this is the last line of an external function
    _withdraw(balance);
  }

  /**
   * @dev Called by owner to partially withdraw funds from the lock.
   * TODO: consider allowing anybody to trigger this as long as it goes to owner anyway?
   */
  function partialWithdraw(uint _amount)
    external
    onlyOwner
  {
    require(_amount > 0, 'GREATER_THAN_ZERO');
    uint balance = _getBalance(address(this));
    require(balance >= _amount, 'NOT_ENOUGH_FUNDS');
    // Security: re-entrancy not a risk as this is the last line of an external function
    _withdraw(_amount);
  }

  /**
   * A function which lets the owner of the lock to change the price for future purchases.
   */
  function updateKeyPrice(
    uint _keyPrice
  )
    external
    onlyOwner
    onlyIfAlive
  {
    uint oldKeyPrice = keyPrice;
    keyPrice = _keyPrice;
    emit PriceChanged(oldKeyPrice, keyPrice);
  }

  /**
   * Public function which returns the total number of unique keys sold (both
   * expired and valid)
   */
  function totalSupply()
    public
    view
    returns (uint)
  {
    return numberOfKeysSold;
  }

  /**
   * @dev private version of the withdraw function which handles all withdrawals from the lock.
   *
   * Security: Be wary of re-entrancy when calling this.
   */
  function _withdraw(uint _amount)
    private
  {
    _transfer(Ownable.owner(), _amount);
    emit Withdrawal(msg.sender, _amount);
  }
}
