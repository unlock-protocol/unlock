pragma solidity 0.4.25;

import './interfaces/IUnlock.sol';
import './interfaces/IERC721.sol';
import './interfaces/ILockCore.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/introspection/ERC165.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol';
import './mixins/MixinApproval.sol';
import './mixins/MixinDisableAndDestroy.sol';
import './mixins/MixinKeyOwner.sol';
import './mixins/MixinKeys.sol';

/**
 * @title The Lock contract
 * @author Julien Genestoux (unlock-protocol.com)
 * Eventually: implement ERC721.
 * @dev ERC165 allows our contract to be queried to determine whether it implements a given interface.
 * Every ERC-721 compliant contract must implement the ERC165 interface.
 * https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract PublicLock is 
  IERC721,
  ILockCore,
  IERC721Receiver,
  ERC165,
  Ownable,
  MixinDisableAndDestroy,
  MixinKeyOwner,
  MixinApproval,
  MixinKeys
{

  using SafeMath for uint;

  // Events
  event PriceChanged(
    uint oldKeyPrice,
    uint keyPrice
  );

  event Withdrawal(
    address indexed _sender,
    uint _amount
  );

  event CancelKey(
    uint indexed tokenId,
    address indexed owner,
    uint refund
  );

  event RefundPenaltyDenominatorChanged(
    uint oldPenaltyDenominator,
    uint refundPenaltyDenominator
  );

  // Fields
  // Unlock Protocol address
  // TODO: should we make that private/internal?
  address public unlockProtocol;

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

  // The version number for this lock contract,
  uint public publicLockVersion;

  // CancelAndRefund will return funds based on time remaining minus this penalty.
  // This is a denominator, so 10 means 10% penalty and 20 means 5% penalty.
  uint public refundPenaltyDenominator;

  /**
   * MODIFIERS
   */
  // Ensure that the Lock has not sold all of its keys.
  modifier notSoldOut() {
    require(maxNumberOfKeys > numberOfKeysSold, 'LOCK_SOLD_OUT');
    _;
  }

  // Constructor
  constructor(
    address _owner,
    uint _expirationDuration,
    uint _keyPrice,
    uint _maxNumberOfKeys,
    uint _version
  ) public
  {
    require(_expirationDuration <= 100 * 365 * 24 * 60 * 60, 'MAX_EXPIRATION_100_YEARS');
    unlockProtocol = msg.sender; // Make sure we link back to Unlock's smart contract.
    Ownable.initialize(_owner);
    expirationDuration = _expirationDuration;
    keyPrice = _keyPrice;
    maxNumberOfKeys = _maxNumberOfKeys;
    publicLockVersion = _version;
    refundPenaltyDenominator = 10;
  }

  /**
   * @dev the fallback function should not be used.  This explicitly reverts
   * to ensure it's never used.
   */
  function()
    external
  {
    revert('NO_FALLBACK');
  }

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
   * This is payable because at some point we want to allow the LOCK to capture a fee on 2ndary
   * market transactions...
   */
  function transferFrom(
    address _from,
    address _recipient,
    uint _tokenId
  )
    external
    payable
    onlyIfAlive
    notSoldOut()
    hasValidKey(_from)
    onlyKeyOwnerOrApproved(_tokenId)
  {
    require(_recipient != address(0), 'INVALID_ADDRESS');

    Key storage fromKey = _getKeyFor(_from);
    Key storage toKey = _getKeyFor(_recipient);

    uint previousExpiration = toKey.expirationTimestamp;

    if (previousExpiration == 0) {
      // The recipient did not have a key previously
      _addNewOwner(_recipient);
      _setKeyOwner(_tokenId, _recipient);
      toKey.tokenId = _tokenId;
    }

    if (previousExpiration <= block.timestamp) {
      // The recipient did not have a key, or had a key but it expired. The new expiration is the
      // sender's key expiration
      toKey.expirationTimestamp = fromKey.expirationTimestamp;
    } else {
      // The recipient has a non expired key. We just add them the corresponding remaining time
      // SafeSub is not required since the if confirms `previousExpiration - block.timestamp` cannot underflow
      toKey.expirationTimestamp = fromKey
        .expirationTimestamp.add(previousExpiration - block.timestamp);
    }
    // Overwite data in all cases
    toKey.data = fromKey.data;

    // Effectively expiring the key for the previous owner
    fromKey.expirationTimestamp = block.timestamp;

    // Clear any previous approvals
    _clearApproval(_tokenId);

    // trigger event
    emit Transfer(
      _from,
      _recipient,
      _tokenId
    );
  }

  /**
   * @dev Called by owner to withdraw all funds from the lock.
   * TODO: consider allowing anybody to trigger this as long as it goes to owner anyway?
   */
  function withdraw()
    external
    onlyOwner
  {
    uint balance = address(this).balance;
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
    uint256 balance = address(this).balance;
    require(balance > 0 && balance >= _amount, 'NOT_ENOUGH_FUNDS');
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
  {
    uint oldKeyPrice = keyPrice;
    keyPrice = _keyPrice;
    emit PriceChanged(oldKeyPrice, keyPrice);
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
   * Public function which returns the total number of unique keys sold (both
   * expired and valid)
   */
  function outstandingKeys()
    public
    view
    returns (uint)
  {
    return numberOfKeysSold;
  }

  /**
   * @notice Handle the receipt of an NFT
   * @dev The ERC721 smart contract calls this function on the recipient
   * after a `safeTransfer`. This function MUST return the function selector,
   * otherwise the caller will revert the transaction. The selector to be
   * returned can be obtained as `this.onERC721Received.selector`. This
   * function MAY throw to revert and reject the transfer.
   * Note: the ERC721 contract address is always the message sender.
   * @param operator The address which called `safeTransferFrom` function
   * @param from The address which previously owned the token
   * @param tokenId The NFT identifier which is being transferred
   * @param data Additional data with no specified format
   * @return `bytes4(keccak256('onERC721Received(address,address,uint,bytes)'))`
   */
  function onERC721Received(
    address operator, // solhint-disable-line no-unused-vars
    address from, // solhint-disable-line no-unused-vars
    uint tokenId, // solhint-disable-line no-unused-vars
    bytes data // solhint-disable-line no-unused-vars
  )
    public
    returns(bytes4)
  {
    return this.onERC721Received.selector;
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
    internal
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

  /**
   * @dev Determines how much of a refund a key owner would receive if they issued
   * a cancelAndRefund now.
   * @param _owner The owner of the key check the refund value for.
   */
  function _getCancelAndRefundValue(
    address _owner
  )
    internal
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

  /**
   * @dev private version of the withdraw function which handles all withdrawals from the lock.
   *
   * Security: Be wary of re-entrancy when calling this.
   */
  function _withdraw(uint _amount)
    private
  {
    Ownable.owner().transfer(_amount);
    emit Withdrawal(msg.sender, _amount);
  }
}