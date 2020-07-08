pragma solidity 0.5.17;

import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721Enumerable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/utils/Address.sol';
import './MixinDisable.sol';
import './MixinLockManagerRole.sol';
import '../interfaces/IUnlock.sol';
import './MixinFunds.sol';
import '../interfaces/hooks/ILockKeyCancelHook.sol';
import '../interfaces/hooks/ILockKeyPurchaseHook.sol';


/**
 * @title Mixin for core lock data and functions.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinLockCore is
  IERC721Enumerable,
  MixinLockManagerRole,
  MixinFunds,
  MixinDisable
{
  using Address for address;

  event Withdrawal(
    address indexed sender,
    address indexed tokenAddress,
    address indexed beneficiary,
    uint amount
  );

  event PricingChanged(
    uint oldKeyPrice,
    uint keyPrice,
    address oldTokenAddress,
    address tokenAddress
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
  uint internal _totalSupply;

  // The account which will receive funds on withdrawal
  address public beneficiary;

  // The denominator component for values specified in basis points.
  uint internal constant BASIS_POINTS_DEN = 10000;

  ILockKeyPurchaseHook public onKeyPurchaseHook;
  ILockKeyCancelHook public onKeyCancelHook;

  // Ensure that the Lock has not sold all of its keys.
  modifier notSoldOut() {
    require(maxNumberOfKeys > _totalSupply, 'LOCK_SOLD_OUT');
    _;
  }

  modifier onlyLockManagerOrBeneficiary()
  {
    require(
      isLockManager(msg.sender) || msg.sender == beneficiary,
      'ONLY_LOCK_MANAGER_OR_BENEFICIARY'
    );
    _;
  }

  function _initializeMixinLockCore(
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

  // The version number of the current implementation on this network
  function publicLockVersion(
  ) public pure
    returns (uint)
  {
    return 8;
  }

  /**
   * @dev Called by owner to withdraw all funds from the lock and send them to the `beneficiary`.
   * @param _tokenAddress specifies the token address to withdraw or 0 for ETH. This is usually
   * the same as `tokenAddress` in MixinFunds.
   * @param _amount specifies the max amount to withdraw, which may be reduced when
   * considering the available balance. Set to 0 or MAX_UINT to withdraw everything.
   *
   * TODO: consider allowing anybody to trigger this as long as it goes to owner anyway?
   *  -- however be wary of draining funds as it breaks the `cancelAndRefund` and `expireAndRefundFor`
   * use cases.
   */
  function withdraw(
    address _tokenAddress,
    uint _amount
  ) external
    onlyLockManagerOrBeneficiary
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
   * A function which lets the owner of the lock change the pricing for future purchases.
   * This consists of 2 parts: The token address and the price in the given token.
   * In order to set the token to ETH, use 0 for the token Address.
   */
  function updateKeyPricing(
    uint _keyPrice,
    address _tokenAddress
  )
    external
    onlyLockManager
    onlyIfAlive
  {
    uint oldKeyPrice = keyPrice;
    address oldTokenAddress = tokenAddress;
    require(
      _tokenAddress == address(0) || IERC20(_tokenAddress).totalSupply() > 0,
      'INVALID_TOKEN'
    );
    keyPrice = _keyPrice;
    tokenAddress = _tokenAddress;
    emit PricingChanged(oldKeyPrice, keyPrice, oldTokenAddress, tokenAddress);
  }

  /**
   * A function which lets the owner of the lock update the beneficiary account,
   * which receives funds on withdrawal.
   */
  function updateBeneficiary(
    address _beneficiary
  ) external
  {
    require(msg.sender == beneficiary || isLockManager(msg.sender), 'ONLY_BENEFICIARY_OR_LOCKMANAGER');
    require(_beneficiary != address(0), 'INVALID_ADDRESS');
    beneficiary = _beneficiary;
  }

  /**
   * @notice Allows a lock manager to add or remove an event hook
   */
  function setEventHooks(
    address _onKeyPurchaseHook,
    address _onKeyCancelHook
  ) external
    onlyLockManager()
  {
    require(_onKeyPurchaseHook == address(0) || _onKeyPurchaseHook.isContract(), 'INVALID_ON_KEY_SOLD_HOOK');
    require(_onKeyCancelHook == address(0) || _onKeyCancelHook.isContract(), 'INVALID_ON_KEY_CANCEL_HOOK');
    onKeyPurchaseHook = ILockKeyPurchaseHook(_onKeyPurchaseHook);
    onKeyCancelHook = ILockKeyCancelHook(_onKeyCancelHook);
  }

  function totalSupply()
    public
    view returns(uint256)
  {
    return _totalSupply;
  }

  /**
   * @notice An ERC-20 style approval, allowing the spender to transfer funds directly from this lock.
   */
  function approveBeneficiary(
    address _spender,
    uint _amount
  ) public
    onlyLockManagerOrBeneficiary
    returns (bool)
  {
    return IERC20(tokenAddress).approve(_spender, _amount);
  }
}
