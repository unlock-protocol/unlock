pragma solidity 0.5.17;

import 'hardlydifficult-ethereum-contracts/contracts/lifecycle/Stoppable.sol';
import '@openzeppelin/upgrades/contracts/Initializable.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import 'unlock-abi-7/IPublicLockV7.sol';

/**
 * @notice Purchase a key priced in any ERC-20 token - either once or as a regular subscription.
 * This allows the user to purchase or subscribe to a key with 1 tx (`approve`)
 * or if the token supports it, with 1 signed message (`permit`).
 *
 * The user can remove the ERC-20 approval to cancel anytime.
 *
 * Risk: if the user transfers or cancels the key, they would naturally expect that also cancels
 * the subscription but it does not. This should be handled by the frontend.
 */
contract KeyPurchaser is Initializable, Stoppable
{
  using Address for address payable;
  using SafeERC20 for IERC20;
  using SafeMath for uint;

  // set on initialize and cannot change

  /**
   * @notice This is the lock for the content users are subscribing to.
   */
  IPublicLockV7 public lock;

  /**
   * @notice The most you will spend on a single key purchase.
   * @dev This allows the lock owner to increase the key price overtime, up to a point, without
   * breaking subscriptions.
   */
  uint public maxPurchasePrice;

  /**
   * @notice How close to the end of a subscription someone may renew the purchase.
   * @dev To ensure that the subscription never expires, we allow this amount of time (maybe 1 day)
   * before it expires for the renewal to happen.
   */
  uint public renewWindow;

  /**
   * @notice The earliest a renewal may be purchased after the previous purchase was done.
   * @dev This typically would not apply, but helps to avoid potential abuse or confusion
   * around cancel and transfer scenarios.
   */
  uint public renewMinFrequency;

  /**
   * @notice The amount of tokens rewarded from the end user to the msg.sender for enabling this feature.
   * This is paid with each renewal of the key.
   */
  uint public msgSenderReward;

  // admin can change these anytime

  /**
   * @notice Metadata for these subscription terms which may be displayed on the frontend.
   */
  string public name;

  /**
   * @notice Metadata for these subscription terms which can be used to supress the offering
   * from the frontend.
   */
  bool internal hidden;

  // store minimal history

  /**
   * @notice Tracks when the key was last purchased for a user's subscription.
   * @dev This is used to enforce renewWindow and renewMinFrequency.
   */
  mapping(address => uint) public timestampOfLastPurchase;

  /**
   * @notice Called once to set terms that cannot change later on.
   * @dev We are using initialize instead of a constructor so that this
   * contract may be deployed with a minimal proxy.
   */
  function initialize(
    IPublicLockV7 _lock,
    address _admin,
    uint _maxPurchasePrice,
    uint _renewWindow,
    uint _renewMinFrequency,
    uint _msgSenderReward
  ) public
    initializer()
  {
    _initializeAdminRole(_admin);
    lock = _lock;
    maxPurchasePrice = _maxPurchasePrice;
    renewWindow = _renewWindow;
    renewMinFrequency = _renewMinFrequency;
    msgSenderReward = _msgSenderReward;
    approveSpending();
  }

  /**
   * @notice Approves the lock to spend funds held by this contract.
   * @dev Automatically called on initialize, needs to be called again if the tokenAddress changes.
   * No permissions required, it's okay to call this again. Typically that would not be required.
   */
  function approveSpending() public
  {
    IERC20 token = IERC20(lock.tokenAddress());
    if(address(token) != address(0))
    {
      token.approve(address(lock), uint(-1));
    }
  }

  /**
   * @notice Used by admins to update metadata which may be leveraged by the frontend.
   * @param _name An optional name to display on the frontend.
   * @param _hidden A flag to indicate if the subscription should be displayed on the frontend.
   */
  function config(
    string memory _name,
    bool _hidden
  ) public
    onlyAdmin()
  {
    name = _name;
    hidden = _hidden;
  }

  /**
   * @notice Indicates if this purchaser should be exposed as an option to users on the frontend.
   * False does not necessarily mean previous subs will no longer work (see `stopped` for that).
   */
  function shouldBeDisplayed() public view returns(bool)
  {
    return !stopped() && !hidden;
  }

  /**
   * @notice Checks if terms allow someone to purchase another key on behalf of a given _recipient.
   * @return purchasePrice as an internal gas optimization so we don't need to look it up again.
   * @param _referrer An address passed to the lock during purchase, potentially offering them a reward.
   * @param _data Arbitrary data included with the lock purchase. This may be used for things such as
   * a discount code, which can be safely done by having the maxPurchasePrice lower then the actual keyPrice.
   */
  function _readyToPurchaseFor(
    address payable _recipient,
    address _referrer,
    bytes memory _data
  ) private view
    // Prevent any purchase after these subscription terms have been stopped
    whenNotStopped
    returns(uint purchasePrice)
  {
    uint lastPurchase = timestampOfLastPurchase[_recipient];
    // `now` must be strictly larger than the timestamp of the last block
    // so now - lastPurchase is always >= 1
    require(now - lastPurchase >= renewMinFrequency, 'BEFORE_MIN_FREQUENCY');

    uint expiration = lock.keyExpirationTimestampFor(_recipient);
    require(expiration <= now || expiration - now <= renewWindow, 'OUTSIDE_RENEW_WINDOW');

    purchasePrice = lock.purchasePriceFor(_recipient, _referrer, _data);
    require(purchasePrice <= maxPurchasePrice, 'PRICE_TOO_HIGH');
  }

  /**
   * @notice Checks if terms allow someone to purchase another key on behalf of a given _recipient.
   * @dev This will throw an error if it's not time to renew a purchase for the _recipient.
   * This is slightly different than the internal _readyToPurchaseFor as a gas optimization.
   * When actually processing the purchase we don't need to check the balance because the transfer
   * itself would fail.
   * @param _referrer An address passed to the lock during purchase, potentially offering them a reward.
   * @param _data Arbitrary data included with the lock purchase. This may be used for things such as
   * a discount code, which can be safely done by having the maxPurchasePrice lower then the actual keyPrice.
   */
  function readyToPurchaseFor(
    address payable _recipient,
    address _referrer,
    bytes memory _data
  ) public view
  {
    uint purchasePrice = _readyToPurchaseFor(_recipient, _referrer, _data);
    purchasePrice = purchasePrice.add(msgSenderReward);

    // It's okay if the lock changes tokenAddress as the ERC-20 approval is specifically
    // the token the endUser wanted to spend
    IERC20 token = IERC20(lock.tokenAddress());
    require(token.balanceOf(_recipient) >= purchasePrice, 'INSUFFICIENT_BALANCE');
    require(token.allowance(_recipient, address(this)) >= purchasePrice, 'INSUFFICIENT_ALLOWANCE');
  }

  /**
   * @notice Called by anyone to purchase or renew a key on behalf of a user.
   * @dev The user must have ERC-20 spending approved and the purchase must meet the terms
   * defined during initialization.
   * @param _referrer An address passed to the lock during purchase, potentially offering them a reward.
   * @param _data Arbitrary data included with the lock purchase. This may be used for things such as
   * a discount code, which can be safely done by having the maxPurchasePrice lower then the actual keyPrice.
   */
  function purchaseFor(
    address payable _recipient,
    address _referrer,
    bytes memory _data
  ) public
  {
    // It's okay if the lock changes tokenAddress as the ERC-20 approval is specifically
    // the token the endUser wanted to spend
    IERC20 token = IERC20(lock.tokenAddress());

    uint keyPrice = _readyToPurchaseFor(_recipient, _referrer, _data);
    uint totalCost = keyPrice.add(msgSenderReward);
    if(totalCost > 0)
    {
      // We don't need safeTransfer as if these do not work the purchase will fail
      token.transferFrom(_recipient, address(this), totalCost);
      if(msgSenderReward > 0)
      {
        token.transfer(msg.sender, msgSenderReward);
      }

      // approve from this contract to the lock is already complete
    }

    lock.purchase(keyPrice, _recipient, _referrer, _data);
    timestampOfLastPurchase[_recipient] = now;

    // RE events: it's not clear emitting an event adds value over the ones from purchase and the token transfer
  }
}
