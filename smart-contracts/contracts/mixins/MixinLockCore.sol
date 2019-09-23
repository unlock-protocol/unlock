pragma solidity 0.5.11;

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
    address indexed sender,
    address indexed tokenAddress,
    address indexed beneficiary,
    uint amount
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
  uint public totalSupply;

  // The account which will receive funds on withdrawal
  address public beneficiary;

  // Ensure that the Lock has not sold all of its keys.
  modifier notSoldOut() {
    require(maxNumberOfKeys > totalSupply, 'LOCK_SOLD_OUT');
    _;
  }

  modifier onlyOwnerOrBeneficiary()
  {
    require(
      msg.sender == owner() || msg.sender == beneficiary,
      'ONLY_LOCK_OWNER_OR_BENEFICIARY'
    );
    _;
  }

  constructor(
    address _beneficiary,
    uint _expirationDuration,
    uint _keyPrice,
    uint _maxNumberOfKeys
  ) internal
  {
    require(_expirationDuration <= 100 * 365 * 24 * 60 * 60, 'MAX_EXPIRATION_100_YEARS');
    unlockProtocol = IUnlock(msg.sender); // Make sure we link back to Unlock's smart contract.
    beneficiary = _beneficiary;
    expirationDuration = _expirationDuration;
    keyPrice = _keyPrice;
    maxNumberOfKeys = _maxNumberOfKeys;
  }

  /**
   * @dev Called by owner to withdraw all funds from the lock and send them to the `beneficiary`.
   * @param _tokenAddress specifies the token address to withdraw or 0 for ETH. This is usually
   * the same as `tokenAddress` in MixinFunds.
   * @param _amount specifies the max amount to withdraw, which may be reduced when
   * considering the available balance. Set to 0 or MAX_UINT to withdraw everything.
   *
   * TODO: consider allowing anybody to trigger this as long as it goes to owner anyway?
   *  -- however be wary of draining funds as it breaks the `cancelAndRefund` and `fullRefund`
   * use cases.
   */
  function withdraw(
    address _tokenAddress,
    uint _amount
  ) external
    onlyOwnerOrBeneficiary
  {
    uint balance = getBalance(_tokenAddress, address(this));
    uint amount;
    if(_amount == 0 || _amount > balance)
    {
      require(balance > 0, 'NOT_ENOUGH_FUNDS');
      amount = balance;
    }
    else
    {
      amount = _amount;
    }

    emit Withdrawal(msg.sender, _tokenAddress, beneficiary, amount);
    // Security: re-entrancy not a risk as this is the last line of an external function
    _transfer(_tokenAddress, beneficiary, amount);
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
   * A function which lets the owner of the lock update the beneficiary account,
   * which receives funds on withdrawal.
   */
  function updateBeneficiary(
    address _beneficiary
  ) external
    onlyOwnerOrBeneficiary
  {
    require(_beneficiary != address(0), 'INVALID_ADDRESS');
    beneficiary = _beneficiary;
  }
}
