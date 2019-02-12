pragma solidity 0.4.25;

import "./interfaces/IUnlock.sol";
import "./interfaces/IERC721.sol";
import "./interfaces/ILockCore.sol";
import "openzeppelin-eth/contracts/ownership/Ownable.sol";
import "./interfaces/IERC721Receiver.sol";
import "openzeppelin-eth/contracts/introspection/ERC165.sol";
import "openzeppelin-eth/contracts/math/SafeMath.sol";

/**
 * TODO: consider error codes rather than strings
 */

/**
 * @title The Lock contract
 * @author Julien Genestoux (unlock-protocol.com)
 * Eventually: implement ERC721.
 * @dev ERC165 allows our contract to be queried to determine whether it implements a given interface.
 * Every ERC-721 compliant contract must implement the ERC165 interface.
 * https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract PublicLock is ILockCore, ERC165, IERC721, IERC721Receiver, Ownable {

  using SafeMath for uint;

  // The struct for a key
  struct Key {
    uint tokenId;
    uint expirationTimestamp;
    bytes data; // Note: This can be expensive?
  }

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

  event Destroy(
    address lock,
    uint balance,
    address owner
  );

  event Disable(address lock);

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

  // Used to disable payable functions when deprecating an old lock
  bool public isAlive;

  // CancelAndRefund will return funds based on time remaining minus this penalty.
  // This is a denominator, so 10 means 10% penalty and 20 means 5% penalty.
  uint public refundPenaltyDenominator;

  // Keys
  // Each owner can have at most exactly one key
  // TODO: could we use public here? (this could be confusing though because it getter will
  // return 0 values when missing a key)
  mapping (address => Key) internal keyByOwner;

  // Each tokenId can have at most exactly one owner at a time.
  // Returns 0 if the token does not exist
  // TODO: once we decouple tokenId from owner address (incl in js), then we can consider
  // merging this with numberOfKeysSold into an array instead.
  mapping (uint => address) internal ownerByTokenId;

  // Addresses of owners are also stored in an array.
  // Addresses are never removed by design to avoid abuses around referals
  address[] public owners;

  // Keeping track of approved transfers
  // This is a mapping of addresses which have approved
  // the transfer of a key to another address where their key can be transfered
  // Note: the approver may actually NOT have a key... and there can only
  // be a single approved beneficiary
  // Note 2: for transfer, both addresses will be different
  // Note 3: for sales (new keys on restricted locks), both addresses will be the same
  mapping (uint => address) internal approved;

  /**
   * MODIFIERS
   */
  // Ensures that an owner has a key
  modifier hasKey(
    address _owner
  ) {
    Key storage key = keyByOwner[_owner];
    require(
      key.expirationTimestamp > 0, "No such key"
    );
    _;
  }

  // Ensures that an owner has a valid key
  modifier hasValidKey(
    address _owner
  ) {
    require(
      getHasValidKey(_owner), "Key is not valid"
    );
    _;
  }

  // Ensure that the caller owns the key
  modifier onlyKeyOwner(
    uint _tokenId
  ) {
    require(
      ownerByTokenId[_tokenId] == msg.sender, "Not the key owner"
    );
    _;
  }

  // Ensures that a key has an owner
  modifier isKey(
    uint _tokenId
  ) {
    require(
      ownerByTokenId[_tokenId] != address(0), "No such key"
    );
    _;
  }

  // Ensure that the caller has a key
  // or that the caller has been approved
  // for ownership of that key
  modifier onlyKeyOwnerOrApproved(
    uint _tokenId
  ) {
    require(
      ownerByTokenId[_tokenId] == msg.sender
      || _getApproved(_tokenId) == msg.sender
    , "Only key owner or approved owner");
    _;
  }

  // Ensure that the Lock has not sold all of its keys.
  modifier notSoldOut() {
    require(maxNumberOfKeys > numberOfKeysSold, "Maximum number of keys already sold");
    _;
  }

  // Only allow usage when contract is Alive
  modifier onlyIfAlive() {
    require(isAlive, "No access after contract has been deprecated");
    _;
  }

  // Constructor
  constructor(
    address _owner,
    uint _expirationDuration,
    uint _keyPrice,
    uint _maxNumberOfKeys,
    uint _version
  )
  public {
    require(_expirationDuration <= 100 * 365 * 24 * 60 * 60, "Expiration duration exceeds 100 years");
    unlockProtocol = msg.sender; // Make sure we link back to Unlock's smart contract.
    Ownable.initialize(_owner);
    ERC165.initialize();
    expirationDuration = _expirationDuration;
    keyPrice = _keyPrice;
    maxNumberOfKeys = _maxNumberOfKeys;
    publicLockVersion = _version;
    isAlive = true;
    refundPenaltyDenominator = 10;
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
    Key storage key = keyByOwner[msg.sender];

    uint refund = _getCancelAndRefundValue(msg.sender);

    emit CancelKey(key.tokenId, msg.sender, refund);
    // expirationTimestamp is a proxy for hasKey, setting this to `now` instead
    // of 0 so that we can still differentiate hasKey from hasValidKey.
    key.expirationTimestamp = now;
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
    require(_recipient != address(0), "Can't Transfer to 0x Address");

    uint previousExpiration = keyByOwner[_recipient].expirationTimestamp;

    if (previousExpiration == 0) {
      // The recipient did not have a key previously
      owners.push(_recipient);
      ownerByTokenId[_tokenId] = _recipient;
      keyByOwner[_recipient].tokenId = _tokenId;
    }

    if (previousExpiration <= now) {
      // The recipient did not have a key, or had a key but it expired. The new expiration is the
      // sender's key expiration
      keyByOwner[_recipient].expirationTimestamp = keyByOwner[_from].expirationTimestamp;
    } else {
      // The recipient has a non expired key. We just add them the corresponding remaining time
      // SafeSub is not required since the if confirms `previousExpiration - now` cannot underflow
      keyByOwner[_recipient].expirationTimestamp =
        keyByOwner[_from].expirationTimestamp.add(previousExpiration - now);
    }
    // Overwite data in all cases
    keyByOwner[_recipient].data = keyByOwner[_from].data;

    // Effectively expiring the key for the previous owner
    keyByOwner[_from].expirationTimestamp = now;

    // Clear any previous approvals
    approved[_tokenId] = address(0);

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
    require(balance > 0, "Not enough funds");
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
    require(_amount > 0, "Must request an amount greater than 0");
    uint256 balance = address(this).balance;
    require(balance > 0 && balance >= _amount, "Not enough funds");
    // Security: re-entrancy not a risk as this is the last line of an external function
    _withdraw(_amount);
  }

  /**
   * This approves _approved to get ownership of _tokenId.
   * Note: that since this is used for both purchase and transfer approvals
   * the approved token may not exist.
   */
  function approve(
    address _approved,
    uint _tokenId
  )
    external
    payable
    onlyIfAlive
    onlyKeyOwner(_tokenId)
  {
    require(_approved != address(0));
    require(msg.sender != _approved, "You can't approve yourself");

    approved[_tokenId] = _approved;
    emit Approval(ownerByTokenId[_tokenId], _approved, _tokenId);
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
   * In the specific case of a Lock, each owner can own only at most 1 key.
   * @return The number of NFTs owned by `_owner`, either 0 or 1.
  */
  function balanceOf(
    address _owner
  )
    external
    view
    returns (uint)
  {
    require(_owner != address(0), "Invalid address");
    return keyByOwner[_owner].expirationTimestamp > 0 ? 1 : 0;
  }

  /**
   * @dev Determines how much of a refund a key owner would receive if they issued
   * a cancelAndRefund now.
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
   * @notice ERC721: Find the owner of an NFT
   * @return The address of the owner of the NFT, if applicable
  */
  function ownerOf(
    uint _tokenId
  )
    external
    view
    isKey(_tokenId)
    returns (address)
  {
    return ownerByTokenId[_tokenId];
  }

  /**
   * @notice Find the tokenId for a given user
   * @return The tokenId of the NFT, else revert
  */
  function getTokenIdFor(
    address _account
  )
    external
    view
    hasKey(_account)
    returns (uint)
  {
    return keyByOwner[_account].tokenId;
  }

  /**
   * external version
   * Will return the approved recipient for a key, if any.
   */
  function getApproved(
    uint _tokenId
  )
    external
    view
    returns (address)
  {
    return _getApproved(_tokenId);
  }

  function disableLock()
    external
    onlyOwner
    onlyIfAlive
  {
    emit Disable(address(this));
    isAlive = false;
  }

  /**
  * @dev Used to clean up old lock contracts from the blockchain
  * TODO: add a check to ensure all keys are INVALID!
   */
  function destroyLock()
    external
    onlyOwner
  {
    require(isAlive == false, "Not allowed to delete an active lock");
    emit Destroy(address(this), this.balance, msg.sender);
    selfdestruct(msg.sender);
    // Note we don't clean up the `locks` data in Unlock.sol as it should not be necessary
    // and leaves some data behind which may be helpful.
  }

  /**
   * Checks if the user has a non-expired key.
   */
  function getHasValidKey(
    address _owner
  )
    public
    view
    returns (bool)
  {
    return keyByOwner[_owner].expirationTimestamp > now;
  }

  /**
   * Public function which returns the total number of unique owners (both expired
   * and valid).  This may be larger than outstandingKeys.
   */
  function numberOfOwners()
    public
    view
    returns (uint)
  {
    return owners.length;
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
  * A function which returns a subset of the keys for this Lock as an array
  * @param _page the page of key owners requested when faceted by page size
  * @param _pageSize the number of Key Owners requested per page
  */
  function getOwnersByPage(uint _page, uint _pageSize)
    public
    view
    returns (address[])
  {
    require(outstandingKeys() > 0, "No keys to retrieve");
    uint _startIndex = _page * _pageSize;
    require(_startIndex >= 0 && _startIndex < outstandingKeys(), "Index must be in-bounds");
    uint endOfPageIndex;

    if (_startIndex + _pageSize > owners.length) {
      endOfPageIndex = owners.length;
      _pageSize = owners.length - _startIndex;
    } else {
      endOfPageIndex = (_startIndex + _pageSize);
    }

    // new temp in-memory array to hold pageSize number of requested owners:
    address[] memory ownersByPage = new address[](_pageSize);
    uint pageIndex = 0;

    // Build the requested set of owners into a new temporary array:
    for (uint i = _startIndex; i < endOfPageIndex; i++) {
      ownersByPage[pageIndex] = owners[i];
      pageIndex++;
    }

    return ownersByPage;
  }

  /**
   * A function which lets the owner of the lock expire a users' key.
   */
  function expireKeyFor(
    address _owner
  )
    public
    onlyOwner
    hasValidKey(_owner)
  {
    keyByOwner[_owner].expirationTimestamp = now; // Effectively expiring the key
  }

  /**
  * @dev Returns the key's data field for a given owner.
  * @param _owner address of the user for whom we search the key
  */
  function keyDataFor(
    address _owner
  )
    public
    view
    hasKey(_owner)
    returns (bytes memory data)
  {
    return keyByOwner[_owner].data;
  }

  /**
  * @dev Returns the key's ExpirationTimestamp field for a given owner.
  * @param _owner address of the user for whom we search the key
  */
  function keyExpirationTimestampFor(
    address _owner
  )
    public
    view
    hasKey(_owner)
    returns (uint timestamp)
  {
    return keyByOwner[_owner].expirationTimestamp;
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
   * @return `bytes4(keccak256("onERC721Received(address,address,uint,bytes)"))`
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
    require(_recipient != address(0), "Can't Purchase For 0x Address");

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

    // We explicitly allow for greater amounts to allow "donations" or partial refunds after
    // discounts (TODO implement partial refunds)
    require(msg.value >= netPrice, "Insufficient funds");
    // TODO: If there is more than the required price, then let's return whatever is extra
    // extra (CAREFUL: re-entrancy!)

    // Assign the key
    uint previousExpiration = keyByOwner[_recipient].expirationTimestamp;
    if (previousExpiration < now) {
      if (previousExpiration == 0) {
        // This is a brand new owner, else an owner of an expired key buying an extension.
        // We increment the tokenId counter
        numberOfKeysSold++;
        owners.push(_recipient);
        // We register the owner of the new tokenID
        ownerByTokenId[numberOfKeysSold] = _recipient;
        // we assign the incremented `numberOfKeysSold` as the tokenId for the new key
        keyByOwner[_recipient].tokenId = numberOfKeysSold;
      }
      // SafeAdd is not required here since expirationDuration is capped to a tiny value
      // (relative to the size of a uint)
      keyByOwner[_recipient].expirationTimestamp = now + expirationDuration;
    } else {
      // This is an existing owner trying to extend their key
      keyByOwner[_recipient].expirationTimestamp = previousExpiration.add(expirationDuration);
    }
    // Overwite data in all cases
    keyByOwner[_recipient].data = _data;

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
    Key storage key = keyByOwner[_owner];
    // Math: safeSub is not required since `hasValidKey` confirms timeRemaining is positive
    uint timeRemaining = key.expirationTimestamp - now;
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
   * Will return the approved recipient for a key transfer or ownership.
   * Note: this does not check that a corresponding key
   * actually exists.
   */
  function _getApproved(
    uint _tokenId
  )
    internal
    view
    returns (address)
  {
    address approvedRecipient = approved[_tokenId];
    require(approvedRecipient != address(0), "No approved recipient exists");
    return approvedRecipient;
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