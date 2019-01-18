pragma solidity 0.4.25;

import "./interfaces/IUnlock.sol";
import "./interfaces/IERC721.sol";
import "./interfaces/ILockCore.sol";
import "openzeppelin-eth/contracts/ownership/Ownable.sol";
import "./interfaces/IERC721Receiver.sol";
import "openzeppelin-eth/contracts/introspection/ERC165.sol";

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
    Key storage key = keyByOwner[_owner];
    require(
      key.expirationTimestamp > now, "Key is not valid"
    );
    _;
  }

  // Ensure that the caller owns the key
  modifier onlyKeyOwner(
    uint _tokenId
  ) {
    require(
      ownerByTokenId[_tokenId] == msg.sender
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

  // Constructor
  constructor(
    address _owner,
    uint _expirationDuration,
    uint _keyPrice,
    uint _maxNumberOfKeys
  )
  public {
    unlockProtocol = msg.sender; // Make sure we link back to Unlock's smart contract.
    Ownable.initialize(_owner);
    ERC165.initialize();
    expirationDuration = _expirationDuration;
    keyPrice = _keyPrice;
    maxNumberOfKeys = _maxNumberOfKeys;
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
    hasValidKey(_referrer)
  {
    return _purchaseFor(_recipient, _referrer, _data);
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
    notSoldOut()
    hasKey(_from)
    onlyKeyOwnerOrApproved(_tokenId)
  {
    require(_recipient != address(0));

    uint previousExpiration = keyByOwner[_recipient].expirationTimestamp;

    if (previousExpiration == 0) {
      // The recipient did not have a key previously
      owners.push(_recipient);
      // Note: not using the tokenId above since ATM we do not transfer tokenId's
      // this will change when we decouple tokenId from address
      ownerByTokenId[uint(_recipient)] = _recipient;
      // At the moment tokenId is the user's address, but as we work towards ERC721
      // support this will change to a sequenceId assigned at purchase.
      keyByOwner[_recipient].tokenId = uint(_recipient);
    }

    if (previousExpiration <= now) {
      // The recipient did not have a key, or had a key but it expired. The new expiration is the
      // sender's key expiration
      keyByOwner[_recipient].expirationTimestamp = keyByOwner[_from].expirationTimestamp;
    } else {
      // The recipient has a non expired key. We just add them the corresponding remaining time
      keyByOwner[_recipient].expirationTimestamp =
        keyByOwner[_from].expirationTimestamp + previousExpiration - now;
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
   * TODO: check for re-entrency?
   */
  function withdraw()
    external
    onlyOwner
  {
    uint balance = address(this).balance;
    require(balance > 0, "Not enough funds");
    _withdraw(balance);
  }

  /**
   * @dev Called by owner to partially withdraw funds from the lock.
   * TODO: consider allowing anybody to trigger this as long as it goes to owner anyway?
   * TODO: check for re-entrency?
   */
  function partialWithdraw(uint _amount)
    external
    onlyOwner
  {
    uint256 balance = address(this).balance;
    require(balance > 0 && balance >= _amount, "Not enough funds");
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
    onlyKeyOwner(_tokenId)
  {
    require(_approved != address(0));

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
    require(_recipient != address(0));

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
      netPrice = inMemoryKeyPrice - discount;
    }

    // We explicitly allow for greater amounts to allow "donations" or partial refunds after
    // discounts (TODO implement partial refunds)
    require(msg.value >= netPrice, "Insufficient funds");
    // TODO: If there is more than the required price, then let's return whatever is extra
    // extra (CAREFUL: re-entrency!)

    // Assign the key
    uint previousExpiration = keyByOwner[_recipient].expirationTimestamp;
    if (previousExpiration < now) {
      if (previousExpiration == 0) { 
        // This is a brand new owner, else an owner of an expired key buying an extension
        numberOfKeysSold++;
        owners.push(_recipient);
        // Note: for ERC721 support we will be changing tokenId to be a sequence id instead
        ownerByTokenId[uint(_recipient)] = _recipient;
        // At the moment tokenId is the user's address, but as we work towards ERC721
        // support this will change to a sequenceId assigned at purchase.
        keyByOwner[_recipient].tokenId = uint(_recipient);
      }
      keyByOwner[_recipient].expirationTimestamp = now + expirationDuration;
    } else {
      // This is an existing owner trying to extend their key
      keyByOwner[_recipient].expirationTimestamp = previousExpiration + expirationDuration;
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
      uint(_recipient) // Note: since each user can own a single token, we use the current
      // owner (new!) for the token id
    );
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
    require(approvedRecipient != address(0));
    return approvedRecipient;
  }

  /**
   * @dev private version of the withdraw function which handles all withdrawals from the lock.
   * TODO: check for re-entrency?
   */
  function _withdraw(uint _amount)
    private
  {
    Ownable.owner().transfer(_amount);
    emit Withdrawal(msg.sender, _amount);
  }

}