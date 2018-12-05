pragma solidity 0.4.24;

import "./interfaces/ILockPublic.sol";
import "./interfaces/IUnlock.sol";

/**
 * TODO: consider error codes rather than strings
 */

/**
 * @title The Lock contract
 * @author Julien Genestoux (unlock-protocol.com)
 * Eventually: implement ERC721.
 *  TODO: consider using a _private version for each method that is being invoked by the
 * public one as this seems to be a pattern.
 */
contract PublicLock is ILockPublic {

  // The struct for a key
  struct Key {
    uint keyId;
    uint expirationTimestamp;
    bytes data; // Note: This can be expensive?
  }

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

  // Keys
  // Each owner can have at most exactly one key
  // TODO: could we use public here? (this could be confusing though because it getter will
  // return 0 values when missing a key)
  mapping (address => Key[]) internal keysByOwner;

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
  mapping (address => address) internal approved;

  /**
   * MODIFIERS
   */
  // Ensures that an owner has a key
  modifier hasKey(
    address _owner
  ) {
    Key[] storage keys = keysByOwner[_owner];
    require(
      keys.length > 0, "User does not have a key"
    );

    require(
      keys[0].expirationTimestamp > 0, "No such key"
    );
    _;
  }

  // Ensures that an owner has a valid key
  modifier hasValidKey(
    address _owner
  ) {
    Key[] storage keys = keysByOwner[_owner];
    require(
      keys.length > 0, "User does not have a key"
    );

    require(
      keys[0].expirationTimestamp > now, "Key is not valid"
    );
    _;
  }

  // Ensure that the caller owns the key
  modifier onlyKeyOwner(
    uint256 _tokenId
  ) {
    require(
      address(_tokenId) == msg.sender
    );
    _;
  }

  // Ensure that the caller has a key
  // or that the caller has been approved
  // for ownership of that key
  modifier onlyKeyOwnerOrApproved(
    uint256 _tokenId
  ) {
    require(
      address(_tokenId) == msg.sender
      || _getApproved(_tokenId) == msg.sender
    , "Only key owner or approved owner");
    _;
  }

  // Ensure that the Lock has not sold all of its keys.
  modifier notSoldOut() {
    require(maxNumberOfKeys > owners.length, "Maximum number of keys already sold");
    _;
  }

  // Constructor
  constructor(
    address _owner,
    uint _expirationDuration,
    uint _keyPrice,
    uint _maxNumberOfKeys
  )
    public
  {
    unlockProtocol = msg.sender; // Make sure we link back to Unlock's smart contract.
    transferOwnership(_owner);
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
    uint256 _tokenId
  )
    external
    payable
    notSoldOut()
    hasKey(address(_tokenId))
    onlyKeyOwnerOrApproved(_tokenId)
  {
    require(_recipient != address(0));

    require(keysByOwner[_from].length > 0, "User does not have a key");

    Key storage fromKey = keysByOwner[_from][keysByOwner[_from].length];
    Key storage newKey;

    uint previousExpiration = fromKey.expirationTimestamp;

    if (previousExpiration == 0) {
      // The recipient did not have a key previously
      owners.push(_recipient);
    }

    newKey.expirationTimestamp = fromKey.expirationTimestamp;

    // Overwite data in all cases
    newKey.data = fromKey.data;

    // Effectively expiring the key for the previous owner
    keysByOwner[_from][keysByOwner[_from].length].expirationTimestamp = now;

    keysByOwner[_recipient].push(newKey);

    // trigger event
    emit Transfer(
      _from,
      _recipient,
      _tokenId
    );
  }

  /**
   * @dev Called by owner to wiwthdraw all funds from the lock.
   * TODO: consider allowing anybody to trigger this as long as it goes to owner anyway?
   * TODO: consider partial withdraws?
   * TODO: check for re-entrency?
   */
  function withdraw(
  )
    external
    onlyOwner
  {
    uint256 balance = address(this).balance;
    require(balance > 0, "Not enough funds");
    address owner = Ownable.owner();
    owner.transfer(balance);
  }

  /**
   * This approves _approved to get ownership of _tokenId.
   * Note: that since this is used for both purchase and transfer approvals
   * the approved token may not exist.
   */
  function approve(
    address _approved,
    uint256 _tokenId
  )
    external
    payable
    onlyKeyOwner(_tokenId)
  {
    require(_approved != address(0));

    approved[address(_tokenId)] = _approved;
    emit Approval(address(_tokenId), _approved, _tokenId);
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
    keyPrice = _keyPrice;
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
    hasKey(_owner)
    returns (uint256)
  {
    return keysByOwner[_owner].length;
  }

  /**
   * @notice ERC721: Find the owner of an NFT
   * @return The address of the owner of the NFT, if applicable
  */
  function ownerOf(
    uint256 _tokenId
  )
    external
    view
    hasKey(address(_tokenId))
    returns (address)
  {
    return address(_tokenId);
  }

  /**
   * external version
   * Will return the approved recipient for a key, if any.
   */
  function getApproved(
    uint256 _tokenId
  )
    external
    view
    returns (address)
  {
    return _getApproved(_tokenId);
  }

  /**
   * Public function which returns the total number of keys (both expired and valid)
   */
  function outstandingKeys()
    public
    view
    returns (uint)
  {
    return owners.length;
  }

  /**
   * A function which lets the owner of the lock expire a users' key.
   */
  function expireKeyFor(
    address _owner,
    uint _ownerKeyIndex
  )
    public
    onlyOwner
    hasValidKey(_owner)
  {
    keysByOwner[_owner][_ownerKeyIndex].expirationTimestamp = now; // Effectively expiring the key
  }

  /**
  * @dev Returns the key's data field for a given owner.
  * @param _owner address of the user for whom we search the key
  */
  function keyDataFor(
    address _owner,
    uint _ownerKeyIndex
  )
    public
    view
    hasKey(_owner)
    returns (bytes data)
  {
    return keysByOwner[_owner][_ownerKeyIndex].data;
  }

  /**
  * @dev Returns the key's ExpirationTimestamp field for a given owner.
  * @param _owner address of the user for whom we search the key
  */
  function keyExpirationTimestampFor(
    address _owner,
    uint _ownerKeyIndex
  )
    public
    view
    hasKey(_owner)
    returns (uint timestamp)
  {
    return keysByOwner[_owner][_ownerKeyIndex].expirationTimestamp;
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
    bytes _data
  )
    internal
    notSoldOut()
  {
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

    Key storage newKey;

    newKey.expirationTimestamp = now + expirationDuration;
    newKey.data = _data;

    keysByOwner[_recipient].push(newKey);

    if (discount > 0) {
      unlock.recordConsumedDiscount(discount, tokens);
    }

    unlock.recordKeyPurchase(netPrice, _referrer);

    // trigger event
    emit Transfer(
      0, // This is a creation.
      _recipient,
      uint256(_recipient) // Note: since each user can own a single token, we use the current
      // owner (new!) for the token id
    );
  }

  /**
   * Will return the approved recipient for a key transfer or ownership.
   * Note: this does not check that a corresponding key
   * actually exists.
   */
  function _getApproved(
    uint256 _tokenId
  )
    internal
    view
    returns (address)
  {
    address approvedRecipient = approved[address(_tokenId)];
    require(approvedRecipient != address(0));
    return approvedRecipient;
  }

}
