// Sources flattened with hardhat v2.4.1 https://hardhat.org

// File contracts/interfaces/IERC721.sol

pragma solidity 0.5.7;

/// @title ERC-721 Non-Fungible Token Standard
/// @dev See https://eips.ethereum.org/EIPS/eip-721
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

  /// @notice Transfers the ownership of an NFT from one address to another address
  /// @dev Throws unless `msg.sender` is the current owner, an authorized
  ///  operator, or the approved address for this NFT. Throws if `_from` is
  ///  not the current owner. Throws if `_to` is the zero address. Throws if
  ///  `_tokenId` is not a valid NFT. When transfer is complete, this function
  ///  checks if `_to` is a smart contract (code size > 0). If so, it calls
  ///  `onERC721Received` on `_to` and throws if the return value is not
  ///  `bytes4(keccak256('onERC721Received(address,address,uint,bytes)'))`.
  /// @param _from The current owner of the NFT
  /// @param _to The new owner
  /// @param _tokenId The NFT to transfer
  /// @param data Additional data with no specified format, sent in call to `_to`
  function safeTransferFrom(address _from, address _to, uint _tokenId, bytes calldata data) external payable;

  /// @notice Transfers the ownership of an NFT from one address to another address
  /// @dev This works identically to the other function with an extra data parameter,
  ///  except this function just sets data to ''
  /// @param _from The current owner of the NFT
  /// @param _to The new owner
  /// @param _tokenId The NFT to transfer
  function safeTransferFrom(address _from, address _to, uint _tokenId) external payable;

  /// @notice Enable or disable approval for a third party ('operator') to manage
  ///  all of `msg.sender`'s assets.
  /// @dev Emits the ApprovalForAll event. The contract MUST allow
  ///  multiple operators per owner.
  /// @param _operator Address to add to the set of authorized operators.
  /// @param _approved True if the operator is approved, false to revoke approval
  function setApprovalForAll(address _operator, bool _approved) external;

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

  /// @notice Get the approved address for a single NFT
  /// @dev Throws if `_tokenId` is not a valid NFT
  /// @param _tokenId The NFT to find the approved address for
  /// @return The approved address for this NFT, or the zero address if there is none
  function getApproved(uint _tokenId) external view returns (address);

  /// @notice Query if an address is an authorized operator for another address
  /// @param _owner The address that owns the NFTs
  /// @param _operator The address that acts on behalf of the owner
  /// @return True if `_operator` is an approved operator for `_owner`, false otherwise
  function isApprovedForAll(address _owner, address _operator) external view returns (bool);

  /// @notice A descriptive name for a collection of NFTs in this contract
  function name() external view returns (string memory _name);
}


// File contracts/interfaces/ILockCore.sol

pragma solidity 0.5.7;


/**
 * @title The Lock interface core methods for a Lock
 * @author HardlyDifficult (unlock-protocol.com)
 */
interface ILockCore {

  /**
  * @dev Purchase function, public version, with no referrer.
  * @param _recipient address of the recipient of the purchased key
  */
  function purchaseFor(
    address _recipient
  )
    external
    payable;

  /**
  * @dev Purchase function, public version, with referrer.
  * @param _recipient address of the recipient of the purchased key
  * @param _referrer address of the user making the referral
  */
  function purchaseForFrom(
    address _recipient,
    address _referrer
  )
    external
    payable;

  /**
   * @dev Destroys the user's key and sends a refund based on the amount of time remaining.
   */
  function cancelAndRefund()
    external;

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
  * @dev Used to disable lock before migrating keys and/or destroying contract.
  * @dev Reverts if called by anyone but the owner.
  * @dev Reverts if isAlive == false
  * @dev Should emit Disable event.
  */
  function disableLock(
  )
    external;

  /**
  * @dev Used to clean up old lock contracts from the blockchain by using selfdestruct.
  * @dev Reverts if called by anyone but the owner.
  * @dev Reverts if isAlive == true
  * @dev Should emit Destroy event.
   */
  function destroyLock(
  )
    external;

  /**
   * @dev Determines how much of a refund a key owner would receive if they issued
   * a cancelAndRefund now.
   * @param _owner The owner of the key check the refund value for.
   * Note that due to the time required to mine a tx, the actual refund amount will be lower
   * than what the user reads from this call.
   */
  function getCancelAndRefundValueFor(
    address _owner
  )
    external
    view
    returns (uint refund);

  /**
   * Checks if the user has a non-expired key.
   */
  function getHasValidKey(
    address _owner
  )
    external
    view
    returns (bool);

  /**
   * Public function which returns the total number of unique owners (both expired
   * and valid).  This may be larger than totalSupply.
   */
  function numberOfOwners()
    external
    view
    returns (uint);

  /**
   * Public function which returns the total number of keys (both expired and valid)
   *
   * This function signature is from the ERC-721 enumerable extension.
   * https://eips.ethereum.org/EIPS/eip-721
   * @notice Count NFTs tracked by this contract
   * @return A count of valid NFTs tracked by this contract, where each one of
   * them has an assigned and queryable owner not equal to the zero address
   */
  function totalSupply()
    external
    view
    returns (uint);

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
    returns (address[] memory);
}


// File zos-lib/contracts/Initializable.sol@v2.2.2

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


// File openzeppelin-eth/contracts/ownership/Ownable.sol@v2.1.3

pragma solidity ^0.5.0;

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable is Initializable {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev The Ownable constructor sets the original `owner` of the contract to the sender
     * account.
     */
    function initialize(address sender) public initializer {
        _owner = sender;
        emit OwnershipTransferred(address(0), _owner);
    }

    /**
     * @return the address of the owner.
     */
    function owner() public view returns (address) {
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
    function isOwner() public view returns (bool) {
        return msg.sender == _owner;
    }

    /**
     * @dev Allows the current owner to relinquish control of the contract.
     * @notice Renouncing to ownership will leave the contract without an owner.
     * It will not be possible to call the functions with the `onlyOwner`
     * modifier anymore.
     */
    function renounceOwnership() public onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
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


// File openzeppelin-solidity/contracts/introspection/IERC165.sol@v2.1.3

pragma solidity ^0.5.0;

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
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}


// File openzeppelin-solidity/contracts/introspection/ERC165.sol@v2.1.3

pragma solidity ^0.5.0;

/**
 * @title ERC165
 * @author Matt Condon (@shrugs)
 * @dev Implements ERC165 using a lookup table.
 */
contract ERC165 is IERC165 {
    bytes4 private constant _INTERFACE_ID_ERC165 = 0x01ffc9a7;
    /**
     * 0x01ffc9a7 ===
     *     bytes4(keccak256('supportsInterface(bytes4)'))
     */

    /**
     * @dev a mapping of interface id to whether or not it's supported
     */
    mapping(bytes4 => bool) private _supportedInterfaces;

    /**
     * @dev A contract implementing SupportsInterfaceWithLookup
     * implement ERC165 itself
     */
    constructor () internal {
        _registerInterface(_INTERFACE_ID_ERC165);
    }

    /**
     * @dev implement supportsInterface(bytes4) using a lookup table
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool) {
        return _supportedInterfaces[interfaceId];
    }

    /**
     * @dev internal method for registering an interface
     */
    function _registerInterface(bytes4 interfaceId) internal {
        require(interfaceId != 0xffffffff);
        _supportedInterfaces[interfaceId] = true;
    }
}


// File openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol@v2.1.3

pragma solidity ^0.5.0;

/**
 * @title ERC721 token receiver interface
 * @dev Interface for any contract that wants to support safeTransfers
 * from ERC721 asset contracts.
 */
contract IERC721Receiver {
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
     * @return `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
     */
    function onERC721Received(address operator, address from, uint256 tokenId, bytes memory data)
    public returns (bytes4);
}


// File openzeppelin-solidity/contracts/token/ERC721/ERC721Holder.sol@v2.1.3

pragma solidity ^0.5.0;

contract ERC721Holder is IERC721Receiver {
    function onERC721Received(address, address, uint256, bytes memory) public returns (bytes4) {
        return this.onERC721Received.selector;
    }
}


// File contracts/mixins/MixinDisableAndDestroy.sol

pragma solidity 0.5.7;


/**
 * @title Mixin allowing the Lock owner to disable a Lock (preventing new purchases)
 * and then destroy it.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinDisableAndDestroy is
  IERC721,
  Ownable
{
  // Used to disable payable functions when deprecating an old lock
  bool public isAlive;

  event Destroy(
    uint balance,
    address indexed owner
  );

  event Disable();

  constructor(
  ) internal
  {
    isAlive = true;
  }

  // Only allow usage when contract is Alive
  modifier onlyIfAlive() {
    require(isAlive, 'LOCK_DEPRECATED');
    _;
  }

  /**
  * @dev Used to disable lock before migrating keys and/or destroying contract
   */
  function disableLock()
    external
    onlyOwner
    onlyIfAlive
  {
    emit Disable();
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
    require(isAlive == false, 'DISABLE_FIRST');
    emit Destroy(address(this).balance, msg.sender);
    selfdestruct(msg.sender);
    // Note we don't clean up the `locks` data in Unlock.sol as it should not be necessary
    // and leaves some data behind ('Unlock.LockBalances') which may be helpful.
  }

}


// File contracts/interfaces/IUnlock.sol

pragma solidity 0.5.7;

/**
 * @title The Unlock Interface
 * @author Nick Furfaro (unlock-protocol.com)
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
  * @param _tokenAddress set to the ERC20 token address, or 0 for ETH.
  * Return type `ILockCore` is the most specific interface from which all lock types inherit.
  */
  function createLock(
    uint _expirationDuration,
    address _tokenAddress,
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


// File openzeppelin-solidity/contracts/token/ERC20/IERC20.sol@v2.1.3

pragma solidity ^0.5.0;

/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);

    function approve(address spender, uint256 value) external returns (bool);

    function transferFrom(address from, address to, uint256 value) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address who) external view returns (uint256);

    function allowance(address owner, address spender) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);
}


// File contracts/mixins/MixinFunds.sol

pragma solidity 0.5.7;

/**
 * @title An implementation of the money related functions.
 * @author HardlyDifficult (unlock-protocol.com)
 */
contract MixinFunds
{
  /**
   * The token-type that this Lock is priced in.  If 0, then use ETH, else this is
   * a ERC20 token address.
   */
  address public tokenAddress;

  constructor(
    address _tokenAddress
  ) public
  {
    require(
      _tokenAddress == address(0) || IERC20(_tokenAddress).totalSupply() > 0,
      'INVALID_TOKEN'
    );
    tokenAddress = _tokenAddress;
  }

  /**
   * Ensures that the msg.sender has paid at least the price stated.
   *
   * With ETH, this means the function originally called was `payable` and the
   * transaction included at least the amount requested.
   *
   * Security: be wary of re-entrancy when calling this function.
   */
  function _chargeAtLeast(
    uint _price
  ) internal
  {
    if(tokenAddress == address(0)) {
      require(msg.value >= _price, 'NOT_ENOUGH_FUNDS');
    } else {
      IERC20 token = IERC20(tokenAddress);
      uint balanceBefore = token.balanceOf(address(this));
      token.transferFrom(msg.sender, address(this), _price);

      // There are known bugs in popular ERC20 implements which means we cannot
      // trust the return value of `transferFrom`.  This require statement ensures
      // that a transfer occurred.
      require(token.balanceOf(address(this)) > balanceBefore, 'TRANSFER_FAILED');
    }
  }

  /**
   * Transfers funds from the contract to the account provided.
   *
   * Security: be wary of re-entrancy when calling this function.
   */
  function _transfer(
    address _to,
    uint _amount
  ) internal
  {
    if(tokenAddress == address(0)) {
      address(uint160(_to)).transfer(_amount);
    } else {
      IERC20 token = IERC20(tokenAddress);
      uint balanceBefore = token.balanceOf(_to);
      token.transfer(_to, _amount);

      // There are known bugs in popular ERC20 implements which means we cannot
      // trust the return value of `transferFrom`.  This require statement ensures
      // that a transfer occurred.
      require(token.balanceOf(_to) > balanceBefore, 'TRANSFER_FAILED');
    }
  }

  /**
   * Gets the current balance of the account provided.
   */
  function _getBalance(
    address _account
  ) internal view
    returns (uint)
  {
    if(tokenAddress == address(0)) {
      return _account.balance;
    } else {
      return IERC20(tokenAddress).balanceOf(_account);
    }
  }
}


// File contracts/mixins/MixinLockCore.sol

pragma solidity 0.5.7;




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
    address indexed _sender,
    uint _amount
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
  uint public numberOfKeysSold;

  // The version number for this lock contract,
  uint public publicLockVersion;

  // Ensure that the Lock has not sold all of its keys.
  modifier notSoldOut() {
    require(maxNumberOfKeys > numberOfKeysSold, 'LOCK_SOLD_OUT');
    _;
  }

  constructor(
    uint _expirationDuration,
    uint _keyPrice,
    uint _maxNumberOfKeys,
    uint _version
  ) internal
  {
    require(_expirationDuration <= 100 * 365 * 24 * 60 * 60, 'MAX_EXPIRATION_100_YEARS');
    unlockProtocol = IUnlock(msg.sender); // Make sure we link back to Unlock's smart contract.
    expirationDuration = _expirationDuration;
    keyPrice = _keyPrice;
    maxNumberOfKeys = _maxNumberOfKeys;
    publicLockVersion = _version;
  }

  /**
   * @dev Called by owner to withdraw all funds from the lock.
   * TODO: consider allowing anybody to trigger this as long as it goes to owner anyway?
   */
  function withdraw()
    external
    onlyOwner
  {
    uint balance = _getBalance(address(this));
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
    uint balance = _getBalance(address(this));
    require(balance >= _amount, 'NOT_ENOUGH_FUNDS');
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
    onlyIfAlive
  {
    uint oldKeyPrice = keyPrice;
    keyPrice = _keyPrice;
    emit PriceChanged(oldKeyPrice, keyPrice);
  }

  /**
   * Public function which returns the total number of unique keys sold (both
   * expired and valid)
   */
  function totalSupply()
    public
    view
    returns (uint)
  {
    return numberOfKeysSold;
  }

  /**
   * @dev private version of the withdraw function which handles all withdrawals from the lock.
   *
   * Security: Be wary of re-entrancy when calling this.
   */
  function _withdraw(uint _amount)
    private
  {
    _transfer(Ownable.owner(), _amount);
    emit Withdrawal(msg.sender, _amount);
  }
}


// File contracts/mixins/MixinKeys.sol

pragma solidity 0.5.7;


/**
 * @title Mixin for managing `Key` data.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinKeys is
  Ownable,
  MixinLockCore
{
  // The struct for a key
  struct Key {
    uint tokenId;
    uint expirationTimestamp;
  }

  // Called when the Lock owner expires a user's Key
  event ExpireKey(uint tokenId);

  // Keys
  // Each owner can have at most exactly one key
  // TODO: could we use public here? (this could be confusing though because it getter will
  // return 0 values when missing a key)
  mapping (address => Key) private keyByOwner;

  // Each tokenId can have at most exactly one owner at a time.
  // Returns 0 if the token does not exist
  // TODO: once we decouple tokenId from owner address (incl in js), then we can consider
  // merging this with numberOfKeysSold into an array instead.
  mapping (uint => address) private ownerByTokenId;

  // Addresses of owners are also stored in an array.
  // Addresses are never removed by design to avoid abuses around referals
  address[] public owners;

  // Ensures that an owner has a key
  modifier hasKey(
    address _owner
  ) {
    Key storage key = keyByOwner[_owner];
    require(
      key.expirationTimestamp > 0, 'NO_SUCH_KEY'
    );
    _;
  }

  // Ensures that an owner has a valid key
  modifier hasValidKey(
    address _owner
  ) {
    require(
      getHasValidKey(_owner), 'KEY_NOT_VALID'
    );
    _;
  }

  // Ensures that a key has an owner
  modifier isKey(
    uint _tokenId
  ) {
    require(
      ownerByTokenId[_tokenId] != address(0), 'NO_SUCH_KEY'
    );
    _;
  }

  // Ensure that the caller owns the key
  modifier onlyKeyOwner(
    uint _tokenId
  ) {
    require(
      isKeyOwner(_tokenId, msg.sender), 'ONLY_KEY_OWNER'
    );
    _;
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
    Key storage key = keyByOwner[_owner];
    key.expirationTimestamp = block.timestamp; // Effectively expiring the key
    emit ExpireKey(key.tokenId);
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
    require(_owner != address(0), 'INVALID_ADDRESS');
    return keyByOwner[_owner].expirationTimestamp > 0 ? 1 : 0;
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
    return keyByOwner[_owner].expirationTimestamp > block.timestamp;
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
  * A function which returns a subset of the keys for this Lock as an array
  * @param _page the page of key owners requested when faceted by page size
  * @param _pageSize the number of Key Owners requested per page
  */
  function getOwnersByPage(uint _page, uint _pageSize)
    public
    view
    returns (address[] memory)
  {
    require(owners.length > 0, 'NO_OUTSTANDING_KEYS');
    uint pageSize = _pageSize;
    uint _startIndex = _page * pageSize;
    uint endOfPageIndex;

    if (_startIndex + pageSize > owners.length) {
      endOfPageIndex = owners.length;
      pageSize = owners.length - _startIndex;
    } else {
      endOfPageIndex = (_startIndex + pageSize);
    }

    // new temp in-memory array to hold pageSize number of requested owners:
    address[] memory ownersByPage = new address[](pageSize);
    uint pageIndex = 0;

    // Build the requested set of owners into a new temporary array:
    for (uint i = _startIndex; i < endOfPageIndex; i++) {
      ownersByPage[pageIndex] = owners[i];
      pageIndex++;
    }

    return ownersByPage;
  }

  /**
   * Checks if the given address owns the given tokenId.
   */
  function isKeyOwner(
    uint _tokenId,
    address _owner
  ) public view
    returns (bool)
  {
    return ownerByTokenId[_tokenId] == _owner;
  }

  /**
  * @dev Returns the key's ExpirationTimestamp field for a given owner.
  * @param _owner address of the user for whom we search the key
  */
  function keyExpirationTimestampFor(
    address _owner
  )
    public view
    hasKey(_owner)
    returns (uint timestamp)
  {
    return keyByOwner[_owner].expirationTimestamp;
  }

  /**
   * Public function which returns the total number of unique owners (both expired
   * and valid).  This may be larger than totalSupply.
   */
  function numberOfOwners()
    public
    view
    returns (uint)
  {
    return owners.length;
  }

  /**
   * @notice ERC721: Find the owner of an NFT
   * @return The address of the owner of the NFT, if applicable
  */
  function ownerOf(
    uint _tokenId
  )
    public view
    isKey(_tokenId)
    returns (address)
  {
    return ownerByTokenId[_tokenId];
  }

  /**
   * Assigns the key a new tokenId (from numberOfKeysSold) if it does not already have
   * one assigned.
   */
  function _assignNewTokenId(
    Key storage _key
  ) internal
  {
    if (_key.tokenId == 0) {
      // This is a brand new owner, else an owner of an expired key buying an extension.
      // We increment the tokenId counter
      numberOfKeysSold++;
      // we assign the incremented `numberOfKeysSold` as the tokenId for the new key
      _key.tokenId = numberOfKeysSold;
    }
  }

  /**
   * Records the owner of a given tokenId
   */
  function _recordOwner(
    address _owner,
    uint _tokenId
  ) internal
  {
    if (ownerByTokenId[_tokenId] != _owner) {
      // TODO: this may include duplicate entries
      owners.push(_owner);
      // We register the owner of the tokenID
      ownerByTokenId[_tokenId] = _owner;
    }
  }

  /**
   * Returns the Key struct for the given owner.
   */
  function _getKeyFor(
    address _owner
  ) internal view
    returns (Key storage)
  {
    return keyByOwner[_owner];
  }
}


// File contracts/mixins/MixinApproval.sol

pragma solidity 0.5.7;



/**
 * @title Mixin for the Approval related functions needed to meet the ERC721
 * standard.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinApproval is
  IERC721,
  MixinDisableAndDestroy,
  MixinKeys
{
  // Keeping track of approved transfers
  // This is a mapping of addresses which have approved
  // the transfer of a key to another address where their key can be transfered
  // Note: the approver may actually NOT have a key... and there can only
  // be a single approved beneficiary
  // Note 2: for transfer, both addresses will be different
  // Note 3: for sales (new keys on restricted locks), both addresses will be the same
  mapping (uint => address) private approved;

  // Keeping track of approved operators for a Key owner.
  // Since an owner can have up to 1 Key, this is similiar to above
  // but the approval does not reset when a transfer occurs.
  mapping (address => mapping (address => bool)) private ownerToOperatorApproved;

  // Ensure that the caller has a key
  // or that the caller has been approved
  // for ownership of that key
  modifier onlyKeyOwnerOrApproved(
    uint _tokenId
  ) {
    require(
      isKeyOwner(_tokenId, msg.sender) ||
        _isApproved(_tokenId, msg.sender) ||
        isApprovedForAll(ownerOf(_tokenId), msg.sender),
      'ONLY_KEY_OWNER_OR_APPROVED');
    _;
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
    onlyKeyOwnerOrApproved(_tokenId)
  {
    require(msg.sender != _approved, 'APPROVE_SELF');

    approved[_tokenId] = _approved;
    emit Approval(ownerOf(_tokenId), _approved, _tokenId);
  }

  /**
   * @dev Sets or unsets the approval of a given operator
   * An operator is allowed to transfer all tokens of the sender on their behalf
   * @param _to operator address to set the approval
   * @param _approved representing the status of the approval to be set
   */
  function setApprovalForAll(
    address _to,
    bool _approved
  ) external
    onlyIfAlive
  {
    require(_to != msg.sender, 'APPROVE_SELF');
    ownerToOperatorApproved[msg.sender][_to] = _approved;
    emit ApprovalForAll(msg.sender, _to, _approved);
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
   * @dev Tells whether an operator is approved by a given owner
   * @param _owner owner address which you want to query the approval of
   * @param _operator operator address which you want to query the approval of
   * @return bool whether the given operator is approved by the given owner
   */
  function isApprovedForAll(
    address _owner,
    address _operator
  ) public view
    returns (bool)
  {
    return ownerToOperatorApproved[_owner][_operator];
  }

  /**
   * @dev Checks if the given user is approved to transfer the tokenId.
   */
  function _isApproved(
    uint _tokenId,
    address _user
  ) internal view
    returns (bool)
  {
    return approved[_tokenId] == _user;
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
    require(approvedRecipient != address(0), 'NONE_APPROVED');
    return approvedRecipient;
  }

  /**
   * @dev Function to clear current approval of a given token ID
   * @param _tokenId uint256 ID of the token to be transferred
   */
  function _clearApproval(
    uint256 _tokenId
  ) internal
  {
    if (approved[_tokenId] != address(0)) {
      approved[_tokenId] = address(0);
    }
  }
}


// File contracts/mixins/MixinGrantKeys.sol

pragma solidity 0.5.7;



/**
 * @title Mixin allowing the Lock owner to grant / gift keys to users.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinGrantKeys is
  IERC721,
  Ownable,
  MixinKeys
{
  /**
   * Allows the Lock owner to give a user a key with no charge.
   */
  function grantKey(
    address _recipient,
    uint _expirationTimestamp
  ) external
    onlyOwner
  {
    _grantKey(_recipient, _expirationTimestamp);
  }

  /**
   * Allows the Lock owner to give a collection of users a key with no charge.
   * All keys granted have the same expiration date.
   */
  function grantKeys(
    address[] calldata _recipients,
    uint _expirationTimestamp
  ) external
    onlyOwner
  {
    for(uint i = 0; i < _recipients.length; i++) {
      _grantKey(_recipients[i], _expirationTimestamp);
    }
  }

  /**
   * Allows the Lock owner to give a collection of users a key with no charge.
   * Each key may be assigned a different expiration date.
   */
  function grantKeys(
    address[] calldata _recipients,
    uint[] calldata _expirationTimestamps
  ) external
    onlyOwner
  {
    for(uint i = 0; i < _recipients.length; i++) {
      _grantKey(_recipients[i], _expirationTimestamps[i]);
    }
  }

  /**
   * Give a key to the given user
   */
  function _grantKey(
    address _recipient,
    uint _expirationTimestamp
  ) private
  {
    require(_recipient != address(0), 'INVALID_ADDRESS');

    Key storage toKey = _getKeyFor(_recipient);
    require(_expirationTimestamp > toKey.expirationTimestamp, 'ALREADY_OWNS_KEY');

    _assignNewTokenId(toKey);
    _recordOwner(_recipient, toKey.tokenId);
    toKey.expirationTimestamp = _expirationTimestamp;

    // trigger event
    emit Transfer(
      address(0), // This is a creation.
      _recipient,
      toKey.tokenId
    );
  }
}


// File contracts/mixins/MixinLockMetadata.sol

pragma solidity 0.5.7;


/**
 * @title Mixin for metadata about the Lock.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinLockMetadata is
  IERC721,
  Ownable
{
  /// A descriptive name for a collection of NFTs in this contract
  string private lockName;

  /**
   * Allows the Lock owner to assign a descriptive name for this Lock.
   */
  function updateLockName(
    string calldata _lockName
  ) external
    onlyOwner
  {
    lockName = _lockName;
  }

  /**
    * @dev Gets the token name
    * @return string representing the token name
    */
  function name(
  ) external view
    returns (string memory)
  {
    return lockName;
  }
}


// File contracts/mixins/MixinNoFallback.sol

pragma solidity 0.5.7;


/**
 * @title Mixin for the fallback function implementation, which simply reverts.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinNoFallback
{
  /**
   * @dev the fallback function should not be used.  This explicitly reverts
   * to ensure it's never used.
   */
  function()
    external
  {
    revert('NO_FALLBACK');
  }
}


// File openzeppelin-solidity/contracts/math/SafeMath.sol@v2.1.3

pragma solidity ^0.5.0;

/**
 * @title SafeMath
 * @dev Unsigned math operations with safety checks that revert on error
 */
library SafeMath {
    /**
    * @dev Multiplies two unsigned integers, reverts on overflow.
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
    * @dev Integer division of two unsigned integers truncating the quotient, reverts on division by zero.
    */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
    * @dev Subtracts two unsigned integers, reverts on overflow (i.e. if subtrahend is greater than minuend).
    */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a);
        uint256 c = a - b;

        return c;
    }

    /**
    * @dev Adds two unsigned integers, reverts on overflow.
    */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a);

        return c;
    }

    /**
    * @dev Divides two unsigned integers and returns the remainder (unsigned integer modulo),
    * reverts when dividing by zero.
    */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0);
        return a % b;
    }
}


// File contracts/mixins/MixinPurchase.sol

pragma solidity 0.5.7;





/**
 * @title Mixin for the purchase-related functions.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinPurchase is
  MixinFunds,
  MixinDisableAndDestroy,
  MixinLockCore,
  MixinKeys
{
  using SafeMath for uint;

  /**
  * @dev Purchase function, public version, with no referrer.
  * @param _recipient address of the recipient of the purchased key
  */
  function purchaseFor(
    address _recipient
  )
    external
    payable
    onlyIfAlive
  {
    return _purchaseFor(_recipient, address(0));
  }

  /**
  * @dev Purchase function, public version, with referrer.
  * @param _recipient address of the recipient of the purchased key
  * @param _referrer address of the user making the referral
  */
  function purchaseForFrom(
    address _recipient,
    address _referrer
  )
    external
    payable
    onlyIfAlive
    hasValidKey(_referrer)
  {
    return _purchaseFor(_recipient, _referrer);
  }

  /**
  * @dev Purchase function: this lets a user purchase a key from the lock for another user
  * @param _recipient address of the recipient of the purchased key
  * This will fail if
  *  - the keyReleaseMechanism is private
  *  - the keyReleaseMechanism is Approved and the recipient has not been previously approved
  *  - the amount value is smaller than the price
  *  - the recipient already owns a key
  * TODO: next version of solidity will allow for message to be added to require.
  */
  function _purchaseFor(
    address _recipient,
    address _referrer
  )
    private
    notSoldOut()
  { // solhint-disable-line function-max-lines
    require(_recipient != address(0), 'INVALID_ADDRESS');

    // Let's get the actual price for the key from the Unlock smart contract
    uint discount;
    uint tokens;
    uint inMemoryKeyPrice = keyPrice;
    (discount, tokens) = unlockProtocol.computeAvailableDiscountFor(_recipient, inMemoryKeyPrice);
    uint netPrice = inMemoryKeyPrice;
    if (discount > inMemoryKeyPrice) {
      netPrice = 0;
    } else {
      // SafeSub not required as the if statement already confirmed `inMemoryKeyPrice - discount` cannot underflow
      netPrice = inMemoryKeyPrice - discount;
    }

    // We explicitly allow for greater amounts of ETH to allow 'donations'
    _chargeAtLeast(netPrice);

    // Assign the key
    Key storage toKey = _getKeyFor(_recipient);
    uint previousExpiration = toKey.expirationTimestamp;
    if (previousExpiration < block.timestamp) {
      _assignNewTokenId(toKey);
      _recordOwner(_recipient, toKey.tokenId);
      // SafeAdd is not required here since expirationDuration is capped to a tiny value
      // (relative to the size of a uint)
      toKey.expirationTimestamp = block.timestamp + expirationDuration;
    } else {
      // This is an existing owner trying to extend their key
      toKey.expirationTimestamp = previousExpiration.add(expirationDuration);
    }

    if (discount > 0) {
      unlockProtocol.recordConsumedDiscount(discount, tokens);
    }

    unlockProtocol.recordKeyPurchase(netPrice, _referrer);

    // trigger event
    emit Transfer(
      address(0), // This is a creation.
      _recipient,
      numberOfKeysSold
    );
  }
}


// File contracts/mixins/MixinRefunds.sol

pragma solidity 0.5.7;





contract MixinRefunds is
  Ownable,
  MixinFunds,
  MixinLockCore,
  MixinKeys
{
  using SafeMath for uint;

  // CancelAndRefund will return funds based on time remaining minus this penalty.
  // This is calculated as `proRatedRefund * refundPenaltyNumerator / refundPenaltyDenominator`.
  uint public refundPenaltyNumerator = 1;
  uint public refundPenaltyDenominator = 10;

  event CancelKey(
    uint indexed tokenId,
    address indexed owner,
    uint refund
  );

  event RefundPenaltyChanged(
    uint oldRefundPenaltyNumerator,
    uint oldRefundPenaltyDenominator,
    uint refundPenaltyNumerator,
    uint refundPenaltyDenominator
  );

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

    if (refund > 0) {
      // Security: doing this last to avoid re-entrancy concerns
      _transfer(msg.sender, refund);
    }
  }

  /**
   * Allow the owner to change the refund penalty.
   */
  function updateRefundPenalty(
    uint _refundPenaltyNumerator,
    uint _refundPenaltyDenominator
  )
    external
    onlyOwner
  {
    require(_refundPenaltyDenominator != 0, 'INVALID_RATE');

    emit RefundPenaltyChanged(
      refundPenaltyNumerator,
      refundPenaltyDenominator,
      _refundPenaltyNumerator,
      _refundPenaltyDenominator
    );
    refundPenaltyNumerator = _refundPenaltyNumerator;
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
   * @dev Determines how much of a refund a key owner would receive if they issued
   * a cancelAndRefund now.
   * @param _owner The owner of the key check the refund value for.
   */
  function _getCancelAndRefundValue(
    address _owner
  )
    private
    view
    hasValidKey(_owner)
    returns (uint refund)
  {
    Key storage key = _getKeyFor(_owner);
    // Math: safeSub is not required since `hasValidKey` confirms timeRemaining is positive
    uint timeRemaining = key.expirationTimestamp - block.timestamp;
    if(timeRemaining >= expirationDuration) {
      refund = keyPrice;
    } else {
      // Math: using safeMul in case keyPrice or timeRemaining is very large
      refund = keyPrice.mul(timeRemaining) / expirationDuration;
    }
    uint penalty = keyPrice.mul(refundPenaltyNumerator) / refundPenaltyDenominator;
    if (refund > penalty) {
      // Math: safeSub is not required since the if confirms this won't underflow
      refund -= penalty;
    } else {
      refund = 0;
    }
  }
}


// File openzeppelin-solidity/contracts/utils/Address.sol@v2.1.3

pragma solidity ^0.5.0;

/**
 * Utility library of inline functions on addresses
 */
library Address {
    /**
     * Returns whether the target address is a contract
     * @dev This function will return false if invoked during the constructor of a contract,
     * as the code is not actually created until after the constructor finishes.
     * @param account address of the account to check
     * @return whether the target address is a contract
     */
    function isContract(address account) internal view returns (bool) {
        uint256 size;
        // XXX Currently there is no better way to check if there is a contract in an address
        // than to check the size of the code at that address.
        // See https://ethereum.stackexchange.com/a/14016/36603
        // for more details about how this works.
        // TODO Check this again before the Serenity release, because all addresses will be
        // contracts then.
        // solhint-disable-next-line no-inline-assembly
        assembly { size := extcodesize(account) }
        return size > 0;
    }
}


// File contracts/mixins/MixinTransfer.sol

pragma solidity 0.5.7;







/**
 * @title Mixin for the transfer-related functions needed to meet the ERC721
 * standard.
 * @author Nick Furfaro
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */

contract MixinTransfer is
  MixinLockCore,
  MixinKeys,
  MixinApproval
{
  using SafeMath for uint;
  using Address for address;

  event TransferFeeChanged(
    uint oldTransferFeeNumerator,
    uint oldTransferFeeDenominator,
    uint transferFeeNumerator,
    uint transferFeeDenominator
  );

  // 0x150b7a02 == bytes4(keccak256('onERC721Received(address,address,uint256,bytes)'))
  bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;

  // The fee relative to keyPrice to charge when transfering a Key to another account
  // (potentially on a 0x marketplace).
  // This is calculated as `keyPrice * transferFeeNumerator / transferFeeDenominator`.
  // TODO: this value is currently ignored and no fee is charged yet!
  uint public transferFeeNumerator = 5;
  uint public transferFeeDenominator = 100;

  /**
   * This is payable because at some point we want to allow the LOCK to capture a fee on 2ndary
   * market transactions...
   */
  function transferFrom(
    address _from,
    address _recipient,
    uint _tokenId
  )
    public
    payable
    onlyIfAlive
    hasValidKey(_from)
    onlyKeyOwnerOrApproved(_tokenId)
  {
    require(_recipient != address(0), 'INVALID_ADDRESS');

    Key storage fromKey = _getKeyFor(_from);
    Key storage toKey = _getKeyFor(_recipient);

    uint previousExpiration = toKey.expirationTimestamp;

    if (toKey.tokenId == 0) {
      toKey.tokenId = fromKey.tokenId;
    }
    _recordOwner(_recipient, toKey.tokenId);

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
  * @notice Transfers the ownership of an NFT from one address to another address
  * @dev This works identically to the other function with an extra data parameter,
  *  except this function just sets data to ''
  * @param _from The current owner of the NFT
  * @param _to The new owner
  * @param _tokenId The NFT to transfer
  */
  function safeTransferFrom(
    address _from,
    address _to,
    uint _tokenId
  )
    external
    payable
  {
    safeTransferFrom(_from, _to, _tokenId, '');
  }

  /**
  * @notice Transfers the ownership of an NFT from one address to another address.
  * When transfer is complete, this functions
  *  checks if `_to` is a smart contract (code size > 0). If so, it calls
  *  `onERC721Received` on `_to` and throws if the return value is not
  *  `bytes4(keccak256('onERC721Received(address,address,uint,bytes)'))`.
  * @param _from The current owner of the NFT
  * @param _to The new owner
  * @param _tokenId The NFT to transfer
  * @param _data Additional data with no specified format, sent in call to `_to`
  */
  function safeTransferFrom(
    address _from,
    address _to,
    uint _tokenId,
    bytes memory _data
  )
    public
    payable
    onlyIfAlive
    onlyKeyOwnerOrApproved(_tokenId)
    hasValidKey(ownerOf(_tokenId))
  {
    transferFrom(_from, _to, _tokenId);
    require(_checkOnERC721Received(_from, _to, _tokenId, _data), 'NON_COMPLIANT_ERC721_RECEIVER');

  }

  /**
   * Allow the Lock owner to change the transfer fee.
   */
  function updateTransferFee(
    uint _transferFeeNumerator,
    uint _transferFeeDenominator
  )
    external
    onlyOwner
  {
    require(_transferFeeDenominator != 0, 'INVALID_RATE');
    emit TransferFeeChanged(
      transferFeeNumerator,
      transferFeeDenominator,
      _transferFeeNumerator,
      _transferFeeDenominator
    );
    transferFeeNumerator = _transferFeeNumerator;
    transferFeeDenominator = _transferFeeDenominator;
  }

  /**
   * @dev Internal function to invoke `onERC721Received` on a target address
   * The call is not executed if the target address is not a contract
   * @param from address representing the previous owner of the given token ID
   * @param to target address that will receive the tokens
   * @param tokenId uint256 ID of the token to be transferred
   * @param _data bytes optional data to send along with the call
   * @return whether the call correctly returned the expected magic value
   */
  function _checkOnERC721Received(
    address from,
    address to,
    uint256 tokenId,
    bytes memory _data
  )
    internal
    returns (bool)
  {
    if (!to.isContract()) {
      return true;
    }
    bytes4 retval = IERC721Receiver(to).onERC721Received(
      msg.sender, from, tokenId, _data);
    return (retval == _ERC721_RECEIVED);
  }

}


// File contracts/PublicLock.sol

pragma solidity 0.5.7;
















/**
 * @title The Lock contract
 * @author Julien Genestoux (unlock-protocol.com)
 * Eventually: implement ERC721.
 * @dev ERC165 allows our contract to be queried to determine whether it implements a given interface.
 * Every ERC-721 compliant contract must implement the ERC165 interface.
 * https://eips.ethereum.org/EIPS/eip-721
 */
contract PublicLock is
  MixinNoFallback,
  ERC721Holder,
  IERC721,
  ILockCore,
  ERC165,
  Ownable,
  MixinFunds,
  MixinDisableAndDestroy,
  MixinLockCore,
  MixinKeys,
  MixinGrantKeys,
  MixinApproval,
  MixinLockMetadata,
  MixinRefunds,
  MixinPurchase,
  MixinTransfer
{
  constructor(
    address _owner,
    uint _expirationDuration,
    address _tokenAddress,
    uint _keyPrice,
    uint _maxNumberOfKeys
  )
    public
    MixinFunds(_tokenAddress)
    MixinLockCore(_expirationDuration, _keyPrice, _maxNumberOfKeys, 1)
  {
    // registering the interface for erc721 with ERC165.sol using
    // the ID specified in the standard: https://eips.ethereum.org/EIPS/eip-721
    _registerInterface(0x80ac58cd);
    // We must manually initialize Ownable.sol
    Ownable.initialize(_owner);
  }
}
