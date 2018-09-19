pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Basic.sol";
import "./Unlock.sol";

/**
 * TODO: consider error codes rather than strings
 */

/**
 * @title The Lock contract
 * @author Julien Genestoux (unlock-protocol.com)
 * Eventually: implement ERC721.
 * @dev The Lock smart contract is an ERC721 compatible smart contract.
 *  However, is has some specificities:
 *  - Since each address owns at most one single key, the tokenId is equal to the owner
 *  - Each address owns at most one single key (ERC721 allows for multiple owned NFTs)
 *  - When transfering the key, we actually reset the expiration date on the transfered key to now
 *    and assign its previous expiration date to the new owner. This is important because it prevents
 *    some abuse around referrals.
 *  TODO: consider using a _private version for each method that is being invoked by the
 * public one as this seems to be a pattern.
 */
contract Lock is Ownable, ERC721Basic {

  // The struct for a key
  struct Key {
    uint expirationTimestamp;
    bytes data; // Note: This can be expensive?
  }

  // Fields
  // Unlock Protocol address
  // TODO: should we make that private/internal?
  address public unlockProtocol;

  // Key release mechanism
  enum KeyReleaseMechanisms { Public, Restricted, Private }
  KeyReleaseMechanisms public keyReleaseMechanism;

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
  mapping (address => Key) internal keyByOwner;

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
  // Ensure the lock is public
  modifier onlyPublic() {
    require(keyReleaseMechanism == KeyReleaseMechanisms.Public, "Only allowed on public locks");
    _;
  }

  // Ensure that the sender is either the lock owner or the key owner on a public lock
  modifier onlyLockOwnerOnRestrictedOrKeyOwnerInPublic(
    uint256 _tokenId
  ) {
    require(keyReleaseMechanism != KeyReleaseMechanisms.Private, "Only allowed on public or restricted locks");

    require(
      owner == msg.sender ||
      (address(_tokenId) == msg.sender && keyReleaseMechanism == KeyReleaseMechanisms.Public)
    );
    _;
  }

  // Ensures that an owner has a key
  modifier hasKey(
    address _owner
  ) {
    _hasKey(_owner);
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

  // Ensure that the caller owns the token
  modifier onlyKeyOwner(
    uint256 _tokenId
  ) {
    require(
      address(_tokenId) == msg.sender
    );
    _;
  }

  // Ensures that the lock is public
  // or that the sender has been approved on restricted locks
  modifier onlyPublicOrApproved(
    address _recipient
  ) {
    require(keyReleaseMechanism == KeyReleaseMechanisms.Public ||
      (keyReleaseMechanism == KeyReleaseMechanisms.Restricted
        && _getApproved(uint256(_recipient)) == _recipient),
        "Only public locks or restriced with an approved recipient");
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
    KeyReleaseMechanisms _keyReleaseMechanism,
    uint _expirationDuration,
    uint _keyPrice,
    uint _maxNumberOfKeys
  )
    public {
      unlockProtocol = msg.sender; // Make sure we link back to Unlock's smart contract. (TODO: handle upgrades?)
      owner = _owner;
      keyReleaseMechanism = _keyReleaseMechanism;
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
   * TODO We need to make this is payable because at some point we want to allow the LOCK to capture a fee on 2ndary
   * market transactions...
   */
  function transferFrom(
    address _from,
    address _recipient,
    uint256 _tokenId
  )
    public
    notSoldOut()
    onlyPublic()
    hasKey(address(_tokenId))
    onlyKeyOwnerOrApproved(_tokenId)
  {
    require(_recipient != address(0));

    uint previousExpiration = keyByOwner[_recipient].expirationTimestamp;

    if (previousExpiration == 0) {
      // The recipient did not have a key previously
      owners.push(_recipient);
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
    public
    onlyLockOwnerOnRestrictedOrKeyOwnerInPublic(_tokenId)
  {
    require(_approved != address(0));

    approved[address(_tokenId)] = _approved;
    emit Approval(address(_tokenId), _approved, _tokenId);
  }

  /**
   * In the specific case of a Lock, each owner can own only at most 1 key.
   * @return The number of NFTs owned by `_owner`, either 0 or 1.
  */
  function balanceOf(
    address _owner
  )
    view
    hasKey(_owner)
    returns (uint256)
  {
    return keyByOwner[_owner].expirationTimestamp > 0 ? 1 : 0;
  }

  /**
   * @notice ERC721: Find the owner of an NFT
   * @return The address of the owner of the NFT, if applicable
  */
  function ownerOf(
    uint256 _tokenId
  )
    view
    hasKey(address(_tokenId))
    returns (address)
  {
    return address(_tokenId);
  }

  function exists(
    uint256 _tokenId
  )
    public
    view
    returns (bool)
  {
    return _hasKey(address(_tokenId));
  }

  /**
   * external version
   * Will return the approved recipient for a key, if any.
   */
  function getApproved(
    uint256 _tokenId
  )
    public
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
    returns (bytes data)
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
   * @dev Returns true if the owner has a key
   * @param _owner address of the user for whom we search the key
   */
  function _hasKey(
    address _owner
  )
    internal
    returns (bool)
  {
    Key storage key = keyByOwner[_owner];
    require(
      key.expirationTimestamp > 0, "No such key"
    );
    return true;
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
    onlyPublicOrApproved(_recipient)
  {
    require(_recipient != address(0));

    // Let's get the actual price for the key from the Unlock smart contract
    Unlock unlock = Unlock(unlockProtocol);
    uint discount;
    uint tokens;
    (discount, tokens) = unlock.computeAvailableDiscountFor(_recipient, keyPrice);
    uint netPrice = keyPrice;
    if (discount > keyPrice) {
      netPrice = 0;
    } else {
      netPrice = keyPrice - discount;
    }

    // We explicitly allow for greater amounts to allow "donations" or partial refunds after
    // discounts (TODO implement partial refunds)
    require(msg.value >= netPrice, "Insufficient funds");
    // TODO: If there is more than the required price, then let's return whatever is extra
    // extra (CAREFUL: re-entrency!)

    // Assign the key
    uint previousExpiration = keyByOwner[_recipient].expirationTimestamp;
    if (previousExpiration < now) {
      owners.push(_recipient);
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

  /**
   * Implemented to comply with ERC721 but does not do anything
   */
  function setApprovalForAll(
    address _operator,
    bool _approved
  )
    public
  {

  }

  /**
   * Implemented to comply with ERC721 but does not do anything
   */
  function isApprovedForAll(
    address _owner,
    address _operator
  )
    public
    view
    returns (bool)
  {
    return false;
  }

  /**
   * Implemented to comply with ERC721 but only calls transferFrom
   */
  function safeTransferFrom(
    address _from,
    address _to,
    uint256 _tokenId
  )
    public
  {
    return transferFrom(_from, _to, _tokenId);
  }

  /**
   * Implemented to comply with ERC721 but only calls transferFrom (data field is ignored)
   */
  function safeTransferFrom(
    address _from,
    address _to,
    uint256 _tokenId,
    bytes _data
  )
    public
  {
    return transferFrom(_from, _to, _tokenId);
  }

}
