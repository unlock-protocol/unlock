pragma solidity ^0.5.0;

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
    require(
      initializing || isConstructor() || !initialized,
      "Contract instance has already been initialized"
    );

    bool isTopLevelCall = !initializing;
    if (isTopLevelCall) {
      initializing = true;
      initialized = true;
    }

    _;

    if (isTopLevelCall) {
      initializing = false;
    }
  }

  /// @dev Returns true if and only if the function is running in the constructor
  function isConstructor() private view returns (bool) {
    // extcodesize checks the size of the code stored in an address, and
    // address returns the current address. Since the code is still not
    // deployed when running a constructor, any checks on its code size will
    // yield zero, making it an effective way to detect if a contract is
    // under construction or not.
    address self = address(this);
    uint256 cs;
    assembly {
      cs := extcodesize(self)
    }
    return cs == 0;
  }

  // Reserved storage space to allow for layout changes in the future.
  uint256[50] private ______gap;
}

/**
 * @dev Interface of the ERC165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[EIP].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
  /**
   * @dev Returns true if this contract implements the interface defined by
   * `interfaceId`. See the corresponding
   * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
   * to learn more about how these ids are created.
   *
   * This function call must use less than 30 000 gas.
   */
  function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

/**
 * @dev Required interface of an ERC721 compliant contract.
 */
contract IERC721 is Initializable, IERC165 {
  event Transfer(
    address indexed from,
    address indexed to,
    uint256 indexed tokenId
  );
  event Approval(
    address indexed owner,
    address indexed approved,
    uint256 indexed tokenId
  );
  event ApprovalForAll(
    address indexed owner,
    address indexed operator,
    bool approved
  );

  /**
   * @dev Returns the number of NFTs in `owner`'s account.
   */
  function balanceOf(address owner) public view returns (uint256 balance);

  /**
   * @dev Returns the owner of the NFT specified by `tokenId`.
   */
  function ownerOf(uint256 tokenId) public view returns (address owner);

  /**
   * @dev Transfers a specific NFT (`tokenId`) from one account (`from`) to
   * another (`to`).
   *
   *
   *
   * Requirements:
   * - `from`, `to` cannot be zero.
   * - `tokenId` must be owned by `from`.
   * - If the caller is not `from`, it must be have been allowed to move this
   * NFT by either `approve` or `setApprovalForAll`.
   */
  function safeTransferFrom(address from, address to, uint256 tokenId) public;

  /**
   * @dev Transfers a specific NFT (`tokenId`) from one account (`from`) to
   * another (`to`).
   *
   * Requirements:
   * - If the caller is not `from`, it must be approved to move this NFT by
   * either `approve` or `setApprovalForAll`.
   */
  function transferFrom(address from, address to, uint256 tokenId) public;

  function approve(address to, uint256 tokenId) public;

  function getApproved(uint256 tokenId) public view returns (address operator);

  function setApprovalForAll(address operator, bool _approved) public;

  function isApprovedForAll(
    address owner,
    address operator
  ) public view returns (bool);

  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId,
    bytes memory data
  ) public;
}

// import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721Enumerable.sol';
/**
 * @title ERC-721 Non-Fungible Token Standard, optional enumeration extension
 * @dev See https://eips.ethereum.org/EIPS/eip-721
 */
contract IERC721Enumerable is Initializable, IERC721 {
  function totalSupply() public view returns (uint256);

  function tokenOfOwnerByIndex(
    address owner,
    uint256 index
  ) public view returns (uint256 tokenId);

  function tokenByIndex(uint256 index) public view returns (uint256);
}

/**
 * @title The PublicLock Interface
 */

contract IPublicLockV6 is IERC721Enumerable {
  // See indentationissue description here:
  // https://github.com/duaraghav8/Ethlint/issues/268
  // solium-disable indentation

  /// Events
  event Destroy(uint balance, address indexed owner);

  event Disable();

  event Withdrawal(
    address indexed sender,
    address indexed tokenAddress,
    address indexed beneficiary,
    uint amount
  );

  event CancelKey(
    uint indexed tokenId,
    address indexed owner,
    address indexed sendTo,
    uint refund
  );

  event RefundPenaltyChanged(
    uint freeTrialLength,
    uint refundPenaltyBasisPoints
  );

  event PricingChanged(
    uint oldKeyPrice,
    uint keyPrice,
    address oldTokenAddress,
    address tokenAddress
  );

  event ExpireKey(uint indexed tokenId);

  event NewLockSymbol(string symbol);

  event TransferFeeChanged(uint transferFeeBasisPoints);

  /// @notice emits anytime the nonce used for off-chain approvals changes.
  event NonceChanged(address indexed keyOwner, uint nextAvailableNonce);

  ///===================================================================

  /// Functions

  function initialize(
    address _owner,
    uint _expirationDuration,
    address _tokenAddress,
    uint _keyPrice,
    uint _maxNumberOfKeys,
    string calldata _lockName
  ) external;

  /**
   * @notice The version number of the current implementation on this network.
   * @return The current version number.
   */
  function publicLockVersion() public pure returns (uint);

  /**
   * @notice Gets the current balance of the account provided.
   * @param _tokenAddress The token type to retrieve the balance of.
   * @param _account The account to get the balance of.
   * @return The number of tokens of the given type for the given address, possibly 0.
   */
  function getBalance(
    address _tokenAddress,
    address _account
  ) external view returns (uint);

  /**
   * @notice Used to disable lock before migrating keys and/or destroying contract.
   * @dev Throws if called by other than the owner.
   * @dev Throws if lock contract has already been disabled.
   */
  function disableLock() external;

  /**
   * @notice Used to clean up old lock contracts from the blockchain.
   * TODO: add a check to ensure all keys are INVALID!
   * @dev Throws if called by other than owner.
   * @dev Throws if lock has not yet been disabled.
   */
  function destroyLock() external;

  /**
   * @dev Called by owner to withdraw all funds from the lock and send them to the `beneficiary`.
   * @dev Throws if called by other than the owner or beneficiary
   * @param _tokenAddress specifies the token address to withdraw or 0 for ETH. This is usually
   * the same as `tokenAddress` in MixinFunds.
   * @param _amount specifies the max amount to withdraw, which may be reduced when
   * considering the available balance. Set to 0 or MAX_UINT to withdraw everything.
   *  -- however be wary of draining funds as it breaks the `cancelAndRefund` and `fullRefund`
   * use cases.
   */
  function withdraw(address _tokenAddress, uint _amount) external;

  /**
   * A function which lets the owner of the lock to change the price for future purchases.
   * @dev Throws if called by other than owner
   * @dev Throws if lock has been disabled
   * @dev Throws if _tokenAddress is not a valid token
   * @param _keyPrice The new price to set for keys
   * @param _tokenAddress The address of the erc20 token to use for pricing the keys,
   * or 0 to use ETH
   */
  function updateKeyPricing(uint _keyPrice, address _tokenAddress) external;

  /**
   * A function which lets the owner of the lock update the beneficiary account,
   * which receives funds on withdrawal.
   * @dev Throws if called by other than owner of beneficiary
   * @dev Throws if _beneficiary is address(0)
   * @param _beneficiary The new address to set as the beneficiary
   */
  function updateBeneficiary(address _beneficiary) external;

  /**
   * A function which lets the owner of the lock expire a users' key.
   * @dev Throws if called by other than lock owner
   * @dev Throws if key owner does not have a valid key
   * @param _owner The address of the key owner
   */
  function expireKeyFor(address _owner) external;

  /**
   * Checks if the user has a non-expired key.
   * @param _owner The address of the key owner
   */
  function getHasValidKey(address _owner) external view returns (bool);

  /**
   * @notice Find the tokenId for a given user
   * @return The tokenId of the NFT, else revert
   * @dev Throws if key owner does not have a valid key
   * @param _account The address of the key owner
   */
  function getTokenIdFor(address _account) external view returns (uint);

  /**
   * A function which returns a subset of the keys for this Lock as an array
   * @param _page the page of key owners requested when faceted by page size
   * @param _pageSize the number of Key Owners requested per page
   * @dev Throws if there are no key owners yet
   */
  function getOwnersByPage(
    uint _page,
    uint _pageSize
  ) external view returns (address[] memory);

  /**
   * Checks if the given address owns the given tokenId.
   * @param _tokenId The tokenId of the key to check
   * @param _owner The potential key owners address
   */
  function isKeyOwner(
    uint _tokenId,
    address _owner
  ) external view returns (bool);

  /**
   * @dev Returns the key's ExpirationTimestamp field for a given owner.
   * @param _owner address of the user for whom we search the key
   * @dev Throws if owner has never owned a key for this lock
   */
  function keyExpirationTimestampFor(
    address _owner
  ) external view returns (uint timestamp);

  /**
   * Public function which returns the total number of unique owners (both expired
   * and valid).  This may be larger than totalSupply.
   */
  function numberOfOwners() external view returns (uint);

  /**
   * Allows the Lock owner to assign a descriptive name for this Lock.
   * @param _lockName The new name for the lock
   * @dev Throws if called by other than the lock owner
   */
  function updateLockName(string calldata _lockName) external;

  /**
   * Allows the Lock owner to assign a Symbol for this Lock.
   * @param _lockSymbol The new Symbol for the lock
   * @dev Throws if called by other than the lock owner
   */
  function updateLockSymbol(string calldata _lockSymbol) external;

  /**
   * @dev Gets the token symbol
   * @return string representing the token symbol
   */
  function symbol() external view returns (string memory);

  /**
   * Allows the Lock owner to update the baseTokenURI for this Lock.
   * @dev Throws if called by other than the lock owner
   * @param _baseTokenURI String representing the base of the URI for this lock.
   */
  function setBaseTokenURI(string calldata _baseTokenURI) external;

  /**  @notice A distinct Uniform Resource Identifier (URI) for a given asset.
   * @dev Throws if `_tokenId` is not a valid NFT. URIs are defined in RFC
   *  3986. The URI may point to a JSON file that conforms to the "ERC721
   *  Metadata JSON Schema".
   * https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
   * @param _tokenId The tokenID we're inquiring about
   * @return String representing the URI for the requested token
   */
  function tokenURI(uint256 _tokenId) external view returns (string memory);

  /**
   * Allows the Lock owner to give a collection of users a key with no charge.
   * Each key may be assigned a different expiration date.
   * @dev Throws if called by other than the lock-owner
   * @param _recipients An array of receiving addresses
   * @param _expirationTimestamps An array of expiration Timestamps for the keys being granted
   */
  function grantKeys(
    address[] calldata _recipients,
    uint[] calldata _expirationTimestamps
  ) external;

  /**
   * @dev Purchase function
   * @param _value the number of tokens to pay for this purchase >= the current keyPrice - any applicable discount
   * (_value is ignored when using ETH)
   * @param _recipient address of the recipient of the purchased key
   * @param _referrer address of the user making the referral
   * @param _data arbitrary data populated by the front-end which initiated the sale
   * @dev Throws if lock is disabled. Throws if lock is sold-out. Throws if _recipient == address(0).
   * @dev Setting _value to keyPrice exactly doubles as a security feature. That way if the lock owner increases the
   * price while my transaction is pending I can't be charged more than I expected (only applicable to ERC-20 when more
   * than keyPrice is approved for spending).
   */
  function purchase(
    uint256 _value,
    address _recipient,
    address _referrer,
    bytes calldata _data
  ) external payable;

  /**
   * Allow the Lock owner to change the transfer fee.
   * @dev Throws if called by other than lock-owner
   * @param _transferFeeBasisPoints The new transfer fee in basis-points(bps).
   * Ex: 200 bps = 2%
   */
  function updateTransferFee(uint _transferFeeBasisPoints) external;

  /**
   * Determines how much of a fee a key owner would need to pay in order to
   * transfer the key to another account.  This is pro-rated so the fee goes down
   * overtime.
   * @dev Throws if _owner does not have a valid key
   * @param _owner The owner of the key check the transfer fee for.
   * @param _time The amount of time to calculate the fee for.
   * @return The transfer fee in seconds.
   */
  function getTransferFee(
    address _owner,
    uint _time
  ) external view returns (uint);

  /**
   * @dev Invoked by the lock owner to destroy the user's key and perform a refund and cancellation of the key
   * @param _keyOwner The key owner to whom we wish to send a refund to
   * @param amount The amount to refund the key-owner
   * @dev Throws if called by other than owner
   * @dev Throws if _keyOwner does not have a valid key
   */
  function fullRefund(address _keyOwner, uint amount) external;

  /**
   * @notice Destroys the msg.sender's key and sends a refund based on the amount of time remaining.
   */
  function cancelAndRefund() external;

  /**
   * @dev Cancels a key owned by a different user and sends the funds to the msg.sender.
   * @param _keyOwner this user's key will be canceled
   * @param _v _r _s getCancelAndRefundApprovalHash signed by the _keyOwner
   */
  function cancelAndRefundFor(
    address _keyOwner,
    uint8 _v,
    bytes32 _r,
    bytes32 _s
  ) external;

  /**
   * @notice Sets the minimum nonce for a valid off-chain approval message from the
   * senders account.
   * @dev This can be used to invalidate a previously signed message.
   */
  function invalidateOffchainApproval(uint _nextAvailableNonce) external;

  /**
   * Allow the owner to change the refund penalty.
   * @dev Throws if called by other than owner
   * @param _freeTrialLength The new duration of free trials for this lock
   * @param _refundPenaltyBasisPoints The new refund penaly in basis-points(bps)
   */
  function updateRefundPenalty(
    uint _freeTrialLength,
    uint _refundPenaltyBasisPoints
  ) external;

  /**
   * @dev Determines how much of a refund a key owner would receive if they issued
   * @param _owner The key owner to get the refund value for.
   * a cancelAndRefund block.timestamp.
   * Note that due to the time required to mine a tx, the actual refund amount will be lower
   * than what the user reads from this call.
   */
  function getCancelAndRefundValueFor(
    address _owner
  ) external view returns (uint refund);

  function keyOwnerToNonce(address) external view returns (uint256);

  /**
   * @notice returns the hash to sign in order to allow another user to cancel on your behalf.
   * @dev this can be computed in JS instead of read from the contract.
   * @param _keyOwner The key owner's address (also the message signer)
   * @param _txSender The address cancelling cancel on behalf of the keyOwner
   * @return approvalHash The hash to sign
   */
  function getCancelAndRefundApprovalHash(
    address _keyOwner,
    address _txSender
  ) external view returns (bytes32 approvalHash);

  ///===================================================================
  /// Auto-generated getter functions from public state variables

  function beneficiary() external view returns (address);

  function erc1820() external view returns (address);

  function expirationDuration() external view returns (uint256);

  function freeTrialLength() external view returns (uint256);

  function isAlive() external view returns (bool);

  function keyCancelInterfaceId() external view returns (bytes32);

  function keySoldInterfaceId() external view returns (bytes32);

  function keyPrice() external view returns (uint256);

  function maxNumberOfKeys() external view returns (uint256);

  function owners(uint256) external view returns (address);

  function refundPenaltyBasisPoints() external view returns (uint256);

  function tokenAddress() external view returns (address);

  function transferFeeBasisPoints() external view returns (uint256);

  function unlockProtocol() external view returns (address);

  function BASIS_POINTS_DEN() external view returns (uint256);

  /// @notice The typehash per the EIP-712 standard
  /// @dev This can be computed in JS instead of read from the contract
  function CANCEL_TYPEHASH() external view returns (bytes32);

  ///===================================================================

  /**
   * @notice Allows the key owner to safely share their key (parent key) by
   * transferring a portion of the remaining time to a new key (child key).
   * @dev Throws if key is not valid.
   * @dev Throws if `_to` is the zero address
   * @param _to The recipient of the shared key
   * @param _tokenId the key to share
   * @param _timeShared The amount of time shared
   * checks if `_to` is a smart contract (code size > 0). If so, it calls
   * `onERC721Received` on `_to` and throws if the return value is not
   * `bytes4(keccak256('onERC721Received(address,address,uint,bytes)'))`.
   * @dev Emit Transfer event
   */
  function shareKey(address _to, uint _tokenId, uint _timeShared) external;

  /// @notice A descriptive name for a collection of NFTs in this contract
  function name() external view returns (string memory _name);

  ///===================================================================

  /// From Openzeppelin's Ownable.sol
  function owner() external view returns (address);

  function isOwner() external view returns (bool);

  function renounceOwnership() external;

  function transferOwnership(address newOwner) external;

  ///===================================================================

  /// From ERC165.sol
  function supportsInterface(bytes4 interfaceId) external view returns (bool);
  ///===================================================================
}
