pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./ERC721.sol";

/**
 * TODO: consider error codes rather than strings
 */

/**
 * @title The Lock contract
 * @author Julien Genestoux (ouvre-boite.com)
 * Eventually: implement ERC721.
 * @dev The Lock smart contract is an ERC721 compatible smart contract.
 *  However, is has some specificities:
 *  - Each address owns at most one single key (ERC721 allows for multiple owned NFTs)
 *  - Since each address owns at most one single key, the tokenId is equal to the owner
 *  - When transfering the key, we actually reset the expiration date on the transfered key to now
 *    and assign its previous expiration date to the new owner. This is important because it prevents
 *    some abuse around referrals.
 *  TODO: consider using a _private version for each method that is being invoked by the
 * public one as this seems to be a pattern.
 */

contract Lock is Ownable, ERC721 {

  // The struct for a key
  struct Key {
    uint expirationTimestamp;
    bytes data; // Note: This can be expensive?
  }

  // Fields

  // Unlock Protocol address
  address internal unlockProtocol;

  // Key release mechanism
  enum KeyReleaseMechanisms { Public, Restricted, Private }
  KeyReleaseMechanisms public keyReleaseMechanism;

  // Duration in seconds for which the keys are valid, after creation
  // should we take a smaller type use less gas?
  uint public expirationDuration;

  // Date at which keys expire
  // (only if expirationDuration is 0)
  uint public expirationTimestamp;

  // Address of the contract which computes the price of the next key
  address public keyPriceCalculator;

  // price in wei of the next key, only if keyPriceCalculator is null
  uint public keyPrice;

  // Max number of keys sold if the keyReleaseMechanism is public
  uint public maxNumberOfKeys;

  // Number of keys in circulation (expired or valid)
  uint public outstandingKeys;

  // Keys
  // Each owner can have at most exactly one key
  mapping (address => Key) internal owners;

  // Keeping track of approved transfers
  mapping (address => address) internal approvedForTransfer;

  // Keeping track of approved purchases.
  // the mapped value is the timestamp until which the approval is valid
  mapping (address => uint) internal approvedForPurchase;

  /**
   * MODIFIERS
   */

  // Ensure the lock is public
  modifier onlyPublic() {
      require(keyReleaseMechanism == KeyReleaseMechanisms.Public, 'Only allowed on public locks');
      _;
  }

  // Ensure the lock is public or permissioned
  modifier onlyPublicOrRestricted() {
      require(
        keyReleaseMechanism == KeyReleaseMechanisms.Public
        || keyReleaseMechanism == KeyReleaseMechanisms.Restricted, 'Only allowed on public or restricted locks');
      _;
  }

  // Ensures that an owner has a key
  modifier hasKey(
    address _owner
  ) {
    Key storage key = owners[_owner];
    require(
      key.expirationTimestamp > 0, 'No such key'
    );
    _;
  }

  modifier hasNoValidKey(
    address _owner
  ) {
    Key storage key = owners[_owner];
    require(
      key.expirationTimestamp < now
    );
    _;
  }

  // Ensures that an owner has a valid key
  modifier hasValidKey(
    address _owner
  ) {
    Key storage key = owners[_owner];
    require(
      key.expirationTimestamp > now + expirationDuration, 'Key is not valid'
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

  // Ensure that the caller has
  modifier onlyKeyOwnerOrApprovedForTransfer(
    uint256 _tokenId
  ) {
    require(
      address(_tokenId) == msg.sender
      || _getApproved(_tokenId) == msg.sender
    );
    _;
  }

  // Constructor
  constructor(
    address _owner,
    address _unlockProtocol,
    KeyReleaseMechanisms _keyReleaseMechanism,
    uint _expirationDuration,
    uint _expirationTimestamp,
    address _keyPriceCalculator,
    uint _keyPrice,
    uint _maxNumberOfKeys
  )
    public
  {
      owner = _owner;
      unlockProtocol = _unlockProtocol;
      keyReleaseMechanism = _keyReleaseMechanism;
      expirationDuration = _expirationDuration;
      expirationTimestamp = _expirationTimestamp;
      keyPriceCalculator = _keyPriceCalculator;
      keyPrice = _keyPrice;
      maxNumberOfKeys = _maxNumberOfKeys;
      outstandingKeys = 0;
  }

  /**
  * @dev Purchase function: this lets user purchase keys from the lock.
  * @param _data optional marker for the key
  * This will fail if
  *  - the keyReleaseMechanism is private
  *  - the keyReleaseMechanism is Approved and the user has not been previously approved
  *  - the amount value is smaller than the price
  *  - the sender already owns a key
  * TODO: next version of solidity will allow for message to be added to require.
  */
  function purchase(
    bytes _data
  )
    public
    payable
    onlyPublicOrRestricted()
    hasNoValidKey(msg.sender)
  {
    require(msg.value >= keyPrice, 'Insufficient funds'); // We explicitly allow for greater amounts to allow "donations".
    require(maxNumberOfKeys > outstandingKeys, 'Maximum number of keys already sold');

    outstandingKeys += 1; // Increment the number of keys
    owners[msg.sender] = Key({
      expirationTimestamp: now + expirationDuration,
      data: _data
    });

    // trigger event
    emit Transfer(
      0, // This is a creation.
      msg.sender,
      uint256(msg.sender) // Note: since each user can own a single token, we use the current owner (new!) for the token id
    );
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
    return owners[_owner].data;
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
    return owners[_owner].expirationTimestamp;
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
     require(balance > 0, 'Not enough funds');
     owner.transfer(balance);
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
    return owners[_owner].expirationTimestamp > 0 ? 1 : 0;
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

  function approve(
    address _approved,
    uint256 _tokenId
  )
    external
    payable
    onlyPublic()
    hasKey(address(_tokenId))
    onlyKeyOwner(_tokenId)
  {
    // Cannot self approve
    require(_approved != address(_tokenId));

    approvedForTransfer[address(_tokenId)] = _approved;
    emit Approval(address(_tokenId), _approved, _tokenId);
  }

  /**
   * Will only allow transfer of keys on public locks.
   * Checks that the key actually exists
   * and that will return its approved recipient
   */
  function _getApproved(
    uint256 _tokenId
  )
    internal
    view
    hasKey(address(_tokenId))
    onlyPublic()
    returns (address)
  {
    address approvedRecipient = approvedForTransfer[address(_tokenId)];
    require(approvedRecipient != address(0));
    return approvedRecipient;
  }

  /**
   * external version
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
   * This is payable because at some point we want to allow the LOCK to capture a fee on 2ndary
   * market transactions...
   */
  function transferFrom(
    address _from,
    address _to,
    uint256 _tokenId
  )
    external
    payable
    hasKey(address(_tokenId))
    hasNoValidKey(_to)
    onlyKeyOwnerOrApprovedForTransfer(_tokenId)
    onlyPublic()
  {
    require(_to != address(0));

    Key storage key = owners[_from];

    owners[_to] = Key({
      expirationTimestamp: key.expirationTimestamp,
      data: key.data
    });

    key.expirationTimestamp = now; // Effectively expiring the key
  }

  /**
   * TODO: allow lock owner to take a cut from transaction (either has fixed or %age)
   */
  // function safeTransferFrom(
  //   address _from,
  //   address _to,
  //   uint256 _tokenId,
  //   bytes data
  // )
  //   external
  //   payable
  //   onlyPublic()
  //   onlyKeyOwnerOrApprovedForTransfer(_tokenId)
  // {
  //   // Do the thing!
  // }


}
