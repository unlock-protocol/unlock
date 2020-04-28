pragma solidity ^0.5.0;


/**
* @title The PublicLock Interface
* @author Nick Furfaro (unlock-protocol.com)
 */

interface IPublicLockV4 {

  ///===================================================================
  /// Events
  event Destroy(
    uint balance,
    address indexed owner
  );

  event Disable();

  event Withdrawal(
    address indexed sender,
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
    uint _refundPenaltyNumerator,
    uint _refundPenaltyDenominator
  );

  event PriceChanged(
    uint oldKeyPrice,
    uint keyPrice
  );

  event ExpireKey(uint indexed tokenId);

  event NewLockSymbol(
    string symbol
  );

  event TransferFeeChanged(
    uint _transferFeeNumerator,
    uint _transferFeeDenominator
  );

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
  ///===================================================================

  /// Functions

  /**
  * @notice The version number of the current implementation on this network.
  * @return The current version number.
  */
  function publicLockVersion() external pure returns (uint16);

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
   * @param _amount specifies the max amount to withdraw, which may be reduced when
   * considering the available balance. Set to 0 or MAX_UINT to withdraw everything.
   *  -- however be wary of draining funds as it breaks the `cancelAndRefund`
   * use case.
   */
  function withdraw(
    uint _amount
  ) external;

  /**
   * A function which lets the owner of the lock to change the price for future purchases.
   * @dev Throws if called by other than owner
   * @dev Throws if lock has been disabled
   * @param _keyPrice The new price to set for keys
   */
  function updateKeyPrice( uint _keyPrice ) external;

  /**
   * A function which lets the owner of the lock update the beneficiary account,
   * which receives funds on withdrawal.
   * @dev Throws if called by other than owner of beneficiary
   * @dev Throws if _beneficiary is address(0)
   * @param _beneficiary The new address to set as the beneficiary
   */
  function updateBeneficiary( address _beneficiary ) external;

  /**
   * A function which lets the owner of the lock expire a users' key.
   * @dev Throws if called by other than lock owner
   * @dev Throws if key owner does not have a valid key
   * @param _owner The address of the key owner
   */
  function expireKeyFor( address _owner ) external;

    /**
   * Checks if the user has a non-expired key.
   * @param _owner The address of the key owner
   */
  function getHasValidKey(
    address _owner
  ) external view returns (bool);

  /**
   * @notice Find the tokenId for a given user
   * @return The tokenId of the NFT, else revert
   * @dev Throws if key owner does not have a valid key
   * @param _account The address of the key owner
  */
  function getTokenIdFor(
    address _account
  ) external view returns (uint);

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
  function updateLockName(
    string calldata _lockName
  ) external;

  /**
   * Allows the Lock owner to assign a Symbol for this Lock.
   * @param _lockSymbol The new Symbol for the lock
   * @dev Throws if called by other than the lock owner
   */
  function updateLockSymbol(
    string calldata _lockSymbol
  ) external;

  /**
    * @dev Gets the token symbol
    * @return string representing the token symbol
    */
  function symbol()
    external view
    returns(string memory);

    /**
   * Allows the Lock owner to update the baseTokenURI for this Lock.
   * @dev Throws if called by other than the lock owner
   * @param _baseTokenURI String representing the base of the URI for this lock.
   */
  function setBaseTokenURI(
    string calldata _baseTokenURI
  ) external;

  /**  @notice A distinct Uniform Resource Identifier (URI) for a given asset.
   * @dev Throws if `_tokenId` is not a valid NFT. URIs are defined in RFC
   *  3986. The URI may point to a JSON file that conforms to the "ERC721
   *  Metadata JSON Schema".
   * https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
   * @param _tokenId The tokenID we're inquiring about
   * @return String representing the URI for the requested token
   */
  function tokenURI(
    uint256 _tokenId
  ) external view returns(string memory);

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
  * @dev Key Purchase function
  * @param _recipient address of the recipient of the purchased key
  * @dev Throws if lock is disabled.
  */
  function purchaseFor(
    address _recipient
  ) external payable;

  /**
  * @dev Purchase function, public version, with referrer.
  * @param _recipient address of the recipient of the purchased key
  * @param _referrer address of the user making the referral
  * @dev Throws if lock is disabled, or if referrer doesn't have a valid key.
  */
  function purchaseForFrom(
    address _recipient,
    address _referrer
  ) external payable;

  /**
   * Allow the Lock owner to change the transfer fee.
   * @dev Throws if called by other than lock-owner
   * Ex: 200 bps = 2%
   */
  function updateTransferFee(
    uint _transferFeeNumerator,
    uint _transferFeeDenominator
  ) external;

  /**
   * Determines how much of a fee a key owner would need to pay in order to
   * transfer the key to another account.  This is pro-rated so the fee goes down
   * overtime.
   * @dev Throws if _owner does not have a valid key
   * @param _owner The owner of the key check the transfer fee for.
   * @return The transfer fee in basis-points(bps).
   */
  function getTransferFee(
    address _owner
  ) external view returns (uint);

  /**
   * @notice Destroys the msg.sender's key and sends a refund based on the amount of time remaining.
   */
  function cancelAndRefund() external;

  /**
   * @dev Cancels a key owned by a different user and sends the funds to the msg.sender.
   * @param _keyOwner this user's key will be canceled
   * @param _signature getCancelAndRefundApprovalHash signed by the _keyOwner
   */
  function cancelAndRefundFor(
    address _keyOwner,
    bytes calldata _signature
  ) external;

  /**
   * Allow the owner to change the refund penalty.
   * @dev Throws if called by other than owner
   */
  function updateRefundPenalty(
    uint _refundPenaltyNumerator,
    uint _refundPenaltyDenominator
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

  function keyOwnerToNonce(address ) external view returns (uint256 );

  /**
   * @dev returns the hash to sign in order to allow another user to cancel on your behalf.
   * @param _keyOwner The key owner's address
   * @param _txSender The address cancelling the key on behalf of the key-owner
   * @return approvalHash The returned hash
   */
  function getCancelAndRefundApprovalHash(
    address _keyOwner,
    address _txSender
  ) external view returns (bytes32 approvalHash);

  /**
  *@notice A utility function for erc721 metadata
  * @param _a String 1
  * @param _b String 2
  * @param _c String 3
  * @param _d String 4
  * @return _concatenatedString The returned string
  */
  function strConcat(
    string calldata _a,
    string calldata _b,
    string calldata _c,
    string calldata _d
  ) external pure returns (string memory _concatenatedString);

  /**
  * @notice A utility function for erc721 metadata
  * @param _i A uint to convert
  * @return _uintAsString the returned string
  */
  function uint2Str(
    uint256 _i
  ) external pure returns (string memory _uintAsString);

  /**
  * @notice A utility function for erc721 metadata
  * @param _addr An address to convert
  * @return A string
  */
  function address2Str(
    address _addr
  ) external pure returns (string memory);

  ///===================================================================
  /// Auto-generated getter functions from public state variables

  function beneficiary() external view returns (address );

  function expirationDuration() external view returns (uint256 );

  function isAlive() external view returns (bool );

  function keyPrice() external view returns (uint256 );

  function maxNumberOfKeys() external view returns (uint256 );

  function owners(uint256 ) external view returns (address );

  function unlockProtocol() external view returns (address );

  ///===================================================================

  /// From Openzeppelin's IERC721.sol

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

  /**
   * @dev Sets or unsets the approval of a given operator
   * An operator is allowed to transfer all tokens of the sender on their behalf
   * @dev Throws if lock is disabled, or if _to == msg.sender.
   * @param _to operator address to set the approval
   * @param _approved representing the status of the approval to be set
   */
  function setApprovalForAll(
    address _to,
    bool _approved
  ) external;

  /**
   * In the specific case of a Lock, each owner can own only at most 1 key.
   * @return The number of NFTs owned by `_owner`, either 0 or 1.
   * @dev Throws if _owner = address(0)
   * @param _owner The address of the key owner
  */
  function balanceOf(
    address _owner
  ) external view returns (uint);

  /// @notice Find the owner of an NFT
  /// @dev NFTs assigned to zero address are considered invalid, and queries
  ///  about them do throw.
  /// @param _tokenId The identifier for an NFT
  /// @return The address of the owner of the NFT
  function ownerOf(uint _tokenId) external view returns (address);

  /**
   * Will return the approved recipient for a key, if any.
   * @param _tokenId The ID of the token we're inquiring about.
   * @return address The approved address (if any)
   */
  function getApproved(
    uint _tokenId
  ) external view returns (address);

  /**
   * @dev Tells whether an operator is approved by a given owner
   * @param _owner owner address which you want to query the approval of
   * @param _operator operator address which you want to query the approval of
   * @return bool whether the given operator is approved by the given owner
   */
  function isApprovedForAll(
    address _owner,
    address _operator
  ) external view returns (bool);

  /// @notice A descriptive name for a collection of NFTs in this contract
  function name() external view returns (string memory _name);
  ///===================================================================

  /// From IERC721Enumerable
  function totalSupply(
  ) external view
    returns (uint256);

  ///===================================================================

  /// From Openzeppelin's Ownable.sol
  function owner() external view returns (address );

  function isOwner() external view returns (bool );

  function renounceOwnership() external;

  function transferOwnership(address newOwner) external;
  ///===================================================================

  /// From ERC165.sol
  function supportsInterface(bytes4 interfaceId) external view returns (bool );
  ///===================================================================

}