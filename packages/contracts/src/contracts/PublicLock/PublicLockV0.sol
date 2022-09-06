// Sources flattened with hardhat v2.4.1 https://hardhat.org

// File contracts/interfaces/ILockCore.sol

pragma solidity 0.4.25;


/**
 * @title The Lock interface core methods for a Lock
 * @author HardlyDifficult (unlock-protocol.com)
 */
interface ILockCore {

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
    payable;

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
    payable;

  /**
   * @dev Called by owner to withdraw all funds from the lock.
   */
  function withdraw(
  )
    external;

  /**
   * @dev Called by owner to partially withdraw funds from the lock.
   */
  function partialWithdraw(
    uint _amount
  )
    external;

  /**
   * A function which lets the owner of the lock expire a users' key.
   */
  function expireKeyFor(
    address _owner
  )
    external;

  /**
   * A function which lets the owner of the lock to change the price for future purchases.
   */
  function updateKeyPrice(
    uint _keyPrice
  )
    external;

  /**
   * Public function which returns the total number of unique owners (both expired
   * and valid).  This may be larger than outstandingKeys.
   */
  function numberOfOwners()
    external
    view
    returns (uint);

  /**
   * Public function which returns the total number of keys (both expired and valid)
   */
  function outstandingKeys()
    external
    view
    returns (uint);

  /**
  * @dev Returns the key's data field for a given owner.
  * @param _owner address of the user for whom we search the key
  */
  function keyDataFor(
    address _owner
  )
    external
    view
    returns (bytes data);

  /**
  * @dev Returns the key's ExpirationTimestamp field for a given owner.
  * @param _owner address of the user for whom we search the key
  */
  function keyExpirationTimestampFor(
    address _owner
  )
    external
    view
    returns (uint timestamp);

  /**
  * @param _page the page of key owners requested when faceted by page size
  * @param _pageSize the number of Key Owners requested per page
  */
  function getOwnersByPage(
    uint _page,
    uint _pageSize
  )
    external
    view
    returns (address[]);
}


// File contracts/interfaces/IUnlock.sol

pragma solidity 0.4.25;

/**
 * @title The Unlock Interface
**/

interface IUnlock {


  // Events
  event NewLock(
    address indexed lockOwner,
    address indexed newLockAddress
  );

  // Use initialize instead of a constructor to support proxies (for upgradeability via zos).
  function initialize(address _owner) external;

  /**
  * @dev Create lock
  * This deploys a lock for a creator. It also keeps track of the deployed lock.
  * Return type `ILockCore` is the most specific interface from which all lock types inherit.
  */
  function createLock(
    uint _expirationDuration,
    uint _keyPrice,
    uint _maxNumberOfKeys
  )
    external
    returns (ILockCore lock);

    /**
   * This function keeps track of the added GDP, as well as grants of discount tokens
   * to the referrer, if applicable.
   * The number of discount tokens granted is based on the value of the referal,
   * the current growth rate and the lock's discount token distribution rate
   * This function is invoked by a previously deployed lock only.
   */
  function recordKeyPurchase(
    uint _value,
    address _referrer // solhint-disable-line no-unused-vars
  )
    external;

    /**
   * This function will keep track of consumed discounts by a given user.
   * It will also grant discount tokens to the creator who is granting the discount based on the
   * amount of discount and compensation rate.
   * This function is invoked by a previously deployed lock only.
   */
  function recordConsumedDiscount(
    uint _discount,
    uint _tokens // solhint-disable-line no-unused-vars
  )
    external;

    /**
   * This function returns the discount available for a user, when purchasing a
   * a key from a lock.
   * This does not modify the state. It returns both the discount and the number of tokens
   * consumed to grant that discount.
   */
  function computeAvailableDiscountFor(
    address _purchaser, // solhint-disable-line no-unused-vars
    uint _keyPrice // solhint-disable-line no-unused-vars
  )
    external
    view
    returns (uint discount, uint tokens);
}


// File contracts/interfaces/IERC721.sol

pragma solidity 0.4.25;

/// @title ERC-721 Non-Fungible Token Standard
/// @dev See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
///  Note: the ERC-165 identifier for this interface is 0x80ac58cd

interface IERC721 {


  /// @dev This emits when ownership of any NFT changes by any mechanism.
  ///  This event emits when NFTs are created (`from` == 0) and destroyed
  ///  (`to` == 0). Exception: during contract creation, any number of NFTs
  ///  may be created and assigned without emitting Transfer. At the time of
  ///  any transfer, the approved address for that NFT (if any) is reset to none.
  event Transfer(address indexed _from, address indexed _to, uint indexed _tokenId);

  /// @dev This emits when the approved address for an NFT is changed or
  ///  reaffirmed. The zero address indicates there is no approved address.
  ///  When a Transfer event emits, this also indicates that the approved
  ///  address for that NFT (if any) is reset to none.
  event Approval(address indexed _owner, address indexed _approved, uint indexed _tokenId);

  /// @dev This emits when an operator is enabled or disabled for an owner.
  ///  The operator can manage all NFTs of the owner.
  event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

  /// @notice Transfer ownership of an NFT -- THE CALLER IS RESPONSIBLE
  ///  TO CONFIRM THAT `_to` IS CAPABLE OF RECEIVING NFTS OR ELSE
  ///  THEY MAY BE PERMANENTLY LOST
  /// @dev Throws unless `msg.sender` is the current owner, an authorized
  ///  operator, or the approved address for this NFT. Throws if `_from` is
  ///  not the current owner. Throws if `_to` is the zero address. Throws if
  ///  `_tokenId` is not a valid NFT.
  /// @param _from The current owner of the NFT
  /// @param _to The new owner
  /// @param _tokenId The NFT to transfer
  function transferFrom(address _from, address _to, uint _tokenId) external payable;

  /// @notice Set or reaffirm the approved address for an NFT
  /// @dev The zero address indicates there is no approved address.
  /// @dev Throws unless `msg.sender` is the current NFT owner, or an authorized
  ///  operator of the current owner.
  /// @param _approved The new approved NFT controller
  /// @param _tokenId The NFT to approve
  function approve(address _approved, uint _tokenId) external payable;

  /// @notice Count all NFTs assigned to an owner
  /// @dev NFTs assigned to the zero address are considered invalid, and this
  ///  function throws for queries about the zero address.
  /// @param _owner An address for whom to query the balance
  /// @return The number of NFTs owned by `_owner`, possibly zero
  function balanceOf(address _owner) external view returns (uint);

  /// @notice Find the owner of an NFT
  /// @dev NFTs assigned to zero address are considered invalid, and queries
  ///  about them do throw.
  /// @param _tokenId The identifier for an NFT
  /// @return The address of the owner of the NFT
  function ownerOf(uint _tokenId) external view returns (address);

  /// @notice Transfers the ownership of an NFT from one address to another address
  /// @dev Throws unless `msg.sender` is the current owner, an authorized
  ///  operator, or the approved address for this NFT. Throws if `_from` is
  ///  not the current owner. Throws if `_to` is the zero address. Throws if
  ///  `_tokenId` is not a valid NFT. When transfer is complete, this function
  ///  checks if `_to` is a smart contract (code size > 0). If so, it calls
  ///  `onERC721Received` on `_to` and throws if the return value is not
  ///  `bytes4(keccak256("onERC721Received(address,address,uint,bytes)"))`.
  /// @param _from The current owner of the NFT
  /// @param _to The new owner
  /// @param _tokenId The NFT to transfer
  /// @param data Additional data with no specified format, sent in call to `_to`
  // function safeTransferFrom(address _from, address _to, uint _tokenId, bytes data) external payable;

  /// @notice Transfers the ownership of an NFT from one address to another address
  /// @dev This works identically to the other function with an extra data parameter,
  ///  except this function just sets data to ""
  /// @param _from The current owner of the NFT
  /// @param _to The new owner
  /// @param _tokenId The NFT to transfer
  // function safeTransferFrom(address _from, address _to, uint _tokenId) external payable;

  /// @notice Enable or disable approval for a third party ("operator") to manage
  ///  all of `msg.sender`'s assets.
  /// @dev Emits the ApprovalForAll event. The contract MUST allow
  ///  multiple operators per owner.
  /// @param _operator Address to add to the set of authorized operators.
  /// @param _approved True if the operator is approved, false to revoke approval
  // function setApprovalForAll(address _operator, bool _approved) external;

  /// @notice Get the approved address for a single NFT
  /// @dev Throws if `_tokenId` is not a valid NFT
  /// @param _tokenId The NFT to find the approved address for
  /// @return The approved address for this NFT, or the zero address if there is none
  function getApproved(uint _tokenId) external view returns (address);

  /// @notice Query if an address is an authorized operator for another address
  /// @param _owner The address that owns the NFTs
  /// @param _operator The address that acts on behalf of the owner
  /// @return True if `_operator` is an approved operator for `_owner`, false otherwise
  // function isApprovedForAll(address _owner, address _operator) external view returns (bool);
}

// interface ERC721TokenReceiver {
//     /// @notice Handle the receipt of an NFT
//     /// @dev The ERC721 smart contract calls this function on the
//     /// recipient after a `transfer`. This function MAY throw to revert and reject the transfer. Return
//     /// of other than the magic value MUST result in the transaction being reverted.
//     /// @notice The contract address is always the message sender.
//     /// @param _operator The address which called `safeTransferFrom` function
//     /// @param _from The address which previously owned the token
//     /// @param _tokenId The NFT identifier which is being transferred
//     /// @param _data Additional data with no specified format
//     /// @return `bytes4(keccak256("onERC721Received(address,address,uint,bytes)"))`
//     /// unless throwing
    // function onERC721Received(
    //   address _operator,
    //   address _from,
    //   uint _tokenId,
    //   bytes _data
    // )
    // external
    // returns(bytes4);
//  }


// File zos-lib/contracts/Initializable.sol@v2.1.0

pragma solidity >=0.4.24 <0.6.0;


/**
 * @title Initializable
 *
 * @dev Helper contract to support initializer functions. To use it, replace
 * the constructor with a function that has the `initializer` modifier.
 * WARNING: Unlike constructors, initializer functions must be manually
 * invoked. This applies both to deploying an Initializable contract, as well
 * as extending an Initializable contract via inheritance.
 * WARNING: When used with inheritance, manual care must be taken to not invoke
 * a parent initializer twice, or ensure that all initializers are idempotent,
 * because this is not dealt with automatically as with constructors.
 */
contract Initializable {

  /**
   * @dev Indicates that the contract has been initialized.
   */
  bool private initialized;

  /**
   * @dev Indicates that the contract is in the process of being initialized.
   */
  bool private initializing;

  /**
   * @dev Modifier to use in the initializer function of a contract.
   */
  modifier initializer() {
    require(initializing || isConstructor() || !initialized, "Contract instance has already been initialized");

    bool wasInitializing = initializing;
    initializing = true;
    initialized = true;

    _;

    initializing = wasInitializing;
  }

  /// @dev Returns true if and only if the function is running in the constructor
  function isConstructor() private view returns (bool) {
    // extcodesize checks the size of the code stored in an address, and
    // address returns the current address. Since the code is still not
    // deployed when running a constructor, any checks on its code size will
    // yield zero, making it an effective way to detect if a contract is
    // under construction or not.
    uint256 cs;
    assembly { cs := extcodesize(address) }
    return cs == 0;
  }

  // Reserved storage space to allow for layout changes in the future.
  uint256[50] private ______gap;
}


// File openzeppelin-eth/contracts/ownership/Ownable.sol@v2.0.2

pragma solidity ^0.4.24;

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable is Initializable {
  address private _owner;


  event OwnershipRenounced(address indexed previousOwner);
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  function initialize(address sender) public initializer {
    _owner = sender;
  }

  /**
   * @return the address of the owner.
   */
  function owner() public view returns(address) {
    return _owner;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(isOwner());
    _;
  }

  /**
   * @return true if `msg.sender` is the owner of the contract.
   */
  function isOwner() public view returns(bool) {
    return msg.sender == _owner;
  }

  /**
   * @dev Allows the current owner to relinquish control of the contract.
   * @notice Renouncing to ownership will leave the contract without an owner.
   * It will not be possible to call the functions with the `onlyOwner`
   * modifier anymore.
   */
  function renounceOwnership() public onlyOwner {
    emit OwnershipRenounced(_owner);
    _owner = address(0);
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) public onlyOwner {
    _transferOwnership(newOwner);
  }

  /**
   * @dev Transfers control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function _transferOwnership(address newOwner) internal {
    require(newOwner != address(0));
    emit OwnershipTransferred(_owner, newOwner);
    _owner = newOwner;
  }

  uint256[50] private ______gap;
}


// File contracts/interfaces/IERC721Receiver.sol

pragma solidity 0.4.25;


/**
 * @title ERC721 token receiver interface
 * @dev Interface for any contract that wants to support safeTransfers
 * from ERC721 asset contracts.
 */
interface IERC721Receiver {
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
    address operator,
    address from,
    uint tokenId,
    bytes data
  )
    public
    returns(bytes4);
}


// File openzeppelin-eth/contracts/introspection/IERC165.sol@v2.0.2

pragma solidity ^0.4.24;


/**
 * @title IERC165
 * @dev https://github.com/ethereum/EIPs/blob/master/EIPS/eip-165.md
 */
interface IERC165 {

  /**
   * @notice Query if a contract implements an interface
   * @param interfaceId The interface identifier, as specified in ERC-165
   * @dev Interface identification is specified in ERC-165. This function
   * uses less than 30,000 gas.
   */
  function supportsInterface(bytes4 interfaceId)
    external
    view
    returns (bool);
}


// File openzeppelin-eth/contracts/introspection/ERC165.sol@v2.0.2

pragma solidity ^0.4.24;


/**
 * @title ERC165
 * @author Matt Condon (@shrugs)
 * @dev Implements ERC165 using a lookup table.
 */
contract ERC165 is Initializable, IERC165 {

  bytes4 private constant _InterfaceId_ERC165 = 0x01ffc9a7;
  /**
   * 0x01ffc9a7 ===
   *   bytes4(keccak256('supportsInterface(bytes4)'))
   */

  /**
   * @dev a mapping of interface id to whether or not it's supported
   */
  mapping(bytes4 => bool) internal _supportedInterfaces;

  /**
   * @dev A contract implementing SupportsInterfaceWithLookup
   * implement ERC165 itself
   */
  function initialize()
    public
    initializer
  {
    _registerInterface(_InterfaceId_ERC165);
  }

  /**
   * @dev implement supportsInterface(bytes4) using a lookup table
   */
  function supportsInterface(bytes4 interfaceId)
    public
    view
    returns (bool)
  {
    return _supportedInterfaces[interfaceId];
  }

  /**
   * @dev private method for registering an interface
   */
  function _registerInterface(bytes4 interfaceId)
    internal
  {
    require(interfaceId != 0xffffffff);
    _supportedInterfaces[interfaceId] = true;
  }

  uint256[50] private ______gap;
}


// File openzeppelin-eth/contracts/math/SafeMath.sol@v2.0.2

pragma solidity ^0.4.24;


/**
 * @title SafeMath
 * @dev Math operations with safety checks that revert on error
 */
library SafeMath {

  /**
  * @dev Multiplies two numbers, reverts on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
    if (a == 0) {
      return 0;
    }

    uint256 c = a * b;
    require(c / a == b);

    return c;
  }

  /**
  * @dev Integer division of two numbers truncating the quotient, reverts on division by zero.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b > 0); // Solidity only automatically asserts when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold

    return c;
  }

  /**
  * @dev Subtracts two numbers, reverts on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b <= a);
    uint256 c = a - b;

    return c;
  }

  /**
  * @dev Adds two numbers, reverts on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    require(c >= a);

    return c;
  }

  /**
  * @dev Divides two numbers and returns the remainder (unsigned integer modulo),
  * reverts when dividing by zero.
  */
  function mod(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b != 0);
    return a % b;
  }
}


// File contracts/PublicLock.sol

pragma solidity 0.4.25;







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
    require(_expirationDuration <= 100 * 365 * 24 * 60 * 60, "Expiration duration exceeds 100 years");
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
    hasValidKey(_from)
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
    emit PriceChanged(oldKeyPrice, _keyPrice);
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
        // This is a brand new owner, else an owner of an expired key buying an extension
        numberOfKeysSold++;
        owners.push(_recipient);
        // Note: for ERC721 support we will be changing tokenId to be a sequence id instead
        ownerByTokenId[uint(_recipient)] = _recipient;
        // At the moment tokenId is the user's address, but as we work towards ERC721
        // support this will change to a sequenceId assigned at purchase.
        keyByOwner[_recipient].tokenId = uint(_recipient);
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
