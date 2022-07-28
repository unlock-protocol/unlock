// SPDX-License-Identifier: MIT
pragma solidity >=0.5.17 <0.9.0;
pragma experimental ABIEncoderV2;

/**
* @title The PublicLock Interface
*/


interface IPublicLock
{

// See indentationissue description here:
// https://github.com/duaraghav8/Ethlint/issues/268
// solium-disable indentation

  /// Functions
  function initialize(
    address _lockCreator,
    uint _expirationDuration,
    address _tokenAddress,
    uint _keyPrice,
    uint _maxNumberOfKeys,
    string calldata _lockName
  ) external;


  // roles
  function DEFAULT_ADMIN_ROLE() external pure returns (bytes32 role);
  function KEY_GRANTER_ROLE() external pure returns (bytes32 role);
  function LOCK_MANAGER_ROLE() external pure returns (bytes32 role);

  /**
  * @notice The version number of the current implementation on this network.
  * @return The current version number.
  */
  function publicLockVersion() external pure returns (uint16);

  /**
   * @dev Called by a lock manager or beneficiary to withdraw all funds from the lock and send them to the `beneficiary`.
   * @dev Throws if called by other than a lock manager or beneficiary
   * @param _tokenAddress specifies the token address to withdraw or 0 for ETH. This is usually
   * the same as `tokenAddress` in MixinFunds.
   * @param _amount specifies the max amount to withdraw, which may be reduced when
   * considering the available balance. Set to 0 or MAX_UINT to withdraw everything.
   *  -- however be wary of draining funds as it breaks the `cancelAndRefund` and `expireAndRefundFor`
   * use cases.
   */
  function withdraw(
    address _tokenAddress,
    uint _amount
  ) external;

  /**
   * @notice An ERC-20 style approval, allowing the spender to transfer funds directly from this lock.
   * @param _spender address that can spend tokens belonging to the lock
   * @param _amount amount of tokens that can be spent by the spender
   */
  function approveBeneficiary(
    address _spender,
    uint _amount
  ) external
    returns (bool);

  /**
   * A function which lets a Lock manager of the lock to change the price for future purchases.
   * @dev Throws if called by other than a Lock manager
   * @dev Throws if lock has been disabled
   * @dev Throws if _tokenAddress is not a valid token
   * @param _keyPrice The new price to set for keys
   * @param _tokenAddress The address of the erc20 token to use for pricing the keys,
   * or 0 to use ETH
   */
  function updateKeyPricing( uint _keyPrice, address _tokenAddress ) external;

  /**
   * A function to change the default duration of each key in the lock
   * @notice keys previously bought are unaffected by this change (i.e.
   * existing keys timestamps are not recalculated/updated)
   * @param _newExpirationDuration the new amount of time for each key purchased 
   * or type(uint).max for a non-expiring key
   */
  function setExpirationDuration(uint _newExpirationDuration) external;

  /**
   * A function which lets a Lock manager update the beneficiary account,
   * which receives funds on withdrawal.
   * @dev Throws if called by other than a Lock manager or beneficiary
   * @dev Throws if _beneficiary is address(0)
   * @param _beneficiary The new address to set as the beneficiary
   */
  function updateBeneficiary( address _beneficiary ) external;

  /**
   * Checks if the user has a non-expired key.
   * @param _user The address of the key owner
   */
  function getHasValidKey(
    address _user
  ) external view returns (bool);

  /**
  * @dev Returns the key's ExpirationTimestamp field for a given owner.
  * @param _tokenId the id of the key
  * @dev Returns 0 if the owner has never owned a key for this lock
  */
  function keyExpirationTimestampFor(
    uint _tokenId
  ) external view returns (uint timestamp);
  
  /**
   * Public function which returns the total number of unique owners (both expired
   * and valid).  This may be larger than totalSupply.
   */
  function numberOfOwners() external view returns (uint);

  /**
   * Allows a Lock manager to assign a descriptive name for this Lock.
   * @param _lockName The new name for the lock
   * @dev Throws if called by other than a Lock manager
   */
  function updateLockName(
    string calldata _lockName
  ) external;

  /**
   * Allows a Lock manager to assign a Symbol for this Lock.
   * @param _lockSymbol The new Symbol for the lock
   * @dev Throws if called by other than a Lock manager
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
   * Allows a Lock manager to update the baseTokenURI for this Lock.
   * @dev Throws if called by other than a Lock manager
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
   * @notice Allows a Lock manager to add or remove an event hook
   */
  function setEventHooks(
    address _onKeyPurchaseHook,
    address _onKeyCancelHook,
    address _onValidKeyHook,
    address _onTokenURIHook,
    address _onKeyTransferHook
  ) external;

  /**
   * Allows a Lock manager to give a collection of users a key with no charge.
   * Each key may be assigned a different expiration date.
   * @dev Throws if called by other than a Lock manager
   * @param _recipients An array of receiving addresses
   * @param _expirationTimestamps An array of expiration Timestamps for the keys being granted
   */
  function grantKeys(
    address[] calldata _recipients,
    uint[] calldata _expirationTimestamps,
    address[] calldata _keyManagers
  ) external;

  /**
   * Allows the Lock owner to extend an existin keys with no charge.
   * @param _tokenId The id of the token to extend
   * @param _duration The duration in secondes to add ot the key
   * @dev set `_duration` to 0 to use the default duration of the lock
   */
  function grantKeyExtension(uint _tokenId, uint _duration) external;

  /**
  * @dev Purchase function
  * @param _values array of tokens amount to pay for this purchase >= the current keyPrice - any applicable discount
  * (_values is ignored when using ETH)
  * @param _recipients array of addresses of the recipients of the purchased key
  * @param _referrers array of addresses of the users making the referral
  * @param _keyManagers optional array of addresses to grant managing rights to a specific address on creation
  * @param _data array of arbitrary data populated by the front-end which initiated the sale
  * @notice when called for an existing and non-expired key, the `_keyManager` param will be ignored 
  * @dev Setting _value to keyPrice exactly doubles as a security feature. That way if the lock owner increases the
  * price while my transaction is pending I can't be charged more than I expected (only applicable to ERC-20 when more
  * than keyPrice is approved for spending).
  */
  function purchase(
    uint256[] calldata _values,
    address[] calldata _recipients,
    address[] calldata _referrers,
    address[] calldata _keyManagers,
    bytes[] calldata _data
  ) external payable;
  
  /**
  * @dev Extend function
  * @param _value the number of tokens to pay for this purchase >= the current keyPrice - any applicable discount
  * (_value is ignored when using ETH)
  * @param _tokenId the id of the key to extend
  * @param _referrer address of the user making the referral
  * @param _data arbitrary data populated by the front-end which initiated the sale
  * @dev Throws if lock is disabled or key does not exist for _recipient. Throws if _recipient == address(0).
  */
  function extend(
    uint _value,
    uint _tokenId,
    address _referrer,
    bytes calldata _data
  ) external payable;


  /**
  * Returns the percentage of the keyPrice to be sent to the referrer (in basic points)
  * @param _referrer the address of the referrer
  */
  function referrerFees(address _referrer) external view;
  
  /**
  * Set a specific percentage of the keyPrice to be sent to the referrer while purchasing, 
  * extending or renewing a key
  * @param _referrer the address of the referrer
  * @param _feeBasisPoint the percentage of the price to be used for this 
  * specific referrer (in basic points)
  * @notice to send a fixed percentage of the key price to all referrers, sett a percentage to `address(0)`
  */
  function setReferrerFee(address _referrer, uint _feeBasisPoint) external;

  /**
   * Merge existing keys
   * @param _tokenIdFrom the id of the token to substract time from
   * @param _tokenIdTo the id of the destination token  to add time
   * @param _amount the amount of time to transfer (in seconds)
   */
  function mergeKeys(uint _tokenIdFrom, uint _tokenIdTo, uint _amount) external;

  /**
   * Deactivate an existing key
   * @param _tokenId the id of token to burn
   * @notice the key will be expired and ownership records will be destroyed
   */
  function burn(uint _tokenId) external;

  /**
  * @param _gasRefundValue price in wei or token in smallest price unit
  * @dev Set the value to be refunded to the sender on purchase
  */
  function setGasRefundValue(uint256 _gasRefundValue) external;
  
  /**
  * _gasRefundValue price in wei or token in smallest price unit
  * @dev Returns the value/rpice to be refunded to the sender on purchase
  */
  function gasRefundValue() external view returns (uint256 _gasRefundValue);

  /**
   * @notice returns the minimum price paid for a purchase with these params.
   * @dev this considers any discount from Unlock or the OnKeyPurchase hook.
   */
  function purchasePriceFor(
    address _recipient,
    address _referrer,
    bytes calldata _data
  ) external view
    returns (uint);

  /**
   * Allow a Lock manager to change the transfer fee.
   * @dev Throws if called by other than a Lock manager
   * @param _transferFeeBasisPoints The new transfer fee in basis-points(bps).
   * Ex: 200 bps = 2%
   */
  function updateTransferFee(
    uint _transferFeeBasisPoints
  ) external;

  /**
   * Determines how much of a fee would need to be paid in order to
   * transfer to another account.  This is pro-rated so the fee goes 
   * down overtime.
   * @dev Throws if _tokenId does not have a valid key
   * @param _tokenId The id of the key check the transfer fee for.
   * @param _time The amount of time to calculate the fee for.
   * @return The transfer fee in seconds.
   */
  function getTransferFee(
    uint _tokenId,
    uint _time
  ) external view returns (uint);

  /**
   * @dev Invoked by a Lock manager to expire the user's key 
   * and perform a refund and cancellation of the key
   * @param _tokenId The key id we wish to refund to
   * @param _amount The amount to refund to the key-owner
   * @dev Throws if called by other than a Lock manager
   * @dev Throws if _keyOwner does not have a valid key
   */
  function expireAndRefundFor(
    uint _tokenId,
    uint _amount
  ) external;

   /**
   * @dev allows the key manager to expire a given tokenId
   * and send a refund to the keyOwner based on the amount of time remaining.
   * @param _tokenId The id of the key to cancel.
   */
  function cancelAndRefund(uint _tokenId) external;

  /**
   * Allow a Lock manager to change the refund penalty.
   * @dev Throws if called by other than a Lock manager
   * @param _freeTrialLength The new duration of free trials for this lock
   * @param _refundPenaltyBasisPoints The new refund penaly in basis-points(bps)
   */
  function updateRefundPenalty(
    uint _freeTrialLength,
    uint _refundPenaltyBasisPoints
  ) external;

  /**
   * @dev Determines how much of a refund a key owner would receive if they issued
   * @param _keyOwner The key owner to get the refund value for.
   * a cancelAndRefund block.timestamp.
   * Note that due to the time required to mine a tx, the actual refund amount will be lower
   * than what the user reads from this call.
   */
  function getCancelAndRefundValue(
    address _keyOwner
  ) external view returns (uint refund);

  function addKeyGranter(address account) external;

  function addLockManager(address account) external;

  function isKeyGranter(address account) external view returns (bool);

  function isLockManager(address account) external view returns (bool);

  function onKeyPurchaseHook() external view returns(address);

  function onKeyCancelHook() external view returns(address);
  
  function onValidKeyHook() external view returns(bool);

  function onTokenURIHook() external view returns(string memory);
  
  function onKeyTransferHook() external view returns(string memory);

  function revokeKeyGranter(address _granter) external;

  function renounceLockManager() external;

  /**
   * @dev Change the maximum number of keys the lock can edit
   * @param _maxNumberOfKeys uint the maximum number of keys
   */
  function setMaxNumberOfKeys (uint _maxNumberOfKeys) external;

   /**
   * Set the maximum number of keys a specific address can use
   * @param _maxKeysPerAddress the maximum amount of key a user can own
   */
  function setMaxKeysPerAddress (uint _maxKeysPerAddress) external;

  /**
   * @return the maximum number of key allowed for a single address
   */
  function maxKeysPerAddress() external view returns (uint);


  ///===================================================================
  /// Auto-generated getter functions from public state variables

  function beneficiary() external view returns (address );

  function expirationDuration() external view returns (uint256 );

  function freeTrialLength() external view returns (uint256 );

  function keyPrice() external view returns (uint256 );

  function maxNumberOfKeys() external view returns (uint256 );

  function refundPenaltyBasisPoints() external view returns (uint256 );

  function tokenAddress() external view returns (address );

  function transferFeeBasisPoints() external view returns (uint256 );

  function unlockProtocol() external view returns (address );

  function keyManagerOf(uint) external view returns (address );

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
  function shareKey(
    address _to,
    uint _tokenId,
    uint _timeShared
  ) external;

  /**
  * @notice Update transfer and cancel rights for a given key
  * @param _tokenId The id of the key to assign rights for
  * @param _keyManager The address to assign the rights to for the given key
  */
  function setKeyManagerOf(
    uint _tokenId,
    address _keyManager
  ) external;
  
  /**
  * Check if a certain key is valid
  * @param _tokenId the id of the key to check validity
  * @notice this makes use of the onValidKeyHook if it is set
  */
  function isValidKey(
    uint _tokenId
  )
    external
    view
    returns (bool);
  
  /**
   * @return The number of keys owned by `_keyOwner` (expired or not)
  */
  function totalKeys(address _keyOwner) external view returns (uint);
  
  /// @notice A descriptive name for a collection of NFTs in this contract
  function name() external view returns (string memory _name);
  ///===================================================================

  /// From ERC165.sol
  function supportsInterface(bytes4 interfaceId) external view returns (bool);
  ///===================================================================

  /// From ERC-721
  /**
   * In the specific case of a Lock, `balanceOf` returns only the tokens with a valid expiration timerange
   * @return balance The number of valid keys owned by `_keyOwner`
  */
  function balanceOf(address _owner) external view returns (uint256 balance);

  /**
    * @dev Returns the owner of the NFT specified by `tokenId`.
    */
  function ownerOf(uint256 tokenId) external view returns (address _owner);

  /**
    * @dev Transfers a specific NFT (`tokenId`) from one account (`from`) to
    * another (`to`).
    *
    * Requirements:
    * - `from`, `to` cannot be zero.
    * - `tokenId` must be owned by `from`.
    * - If the caller is not `from`, it must be have been allowed to move this
    * NFT by either {approve} or {setApprovalForAll}.
    */
  function safeTransferFrom(address from, address to, uint256 tokenId) external;
  
  /** 
  * an ERC721-like function to transfer a token from one account to another
  * @param from the owner of token to transfer
  * @param to the address that will receive the token
  * @param tokenId the id of the token
  * @notice requirements: if the caller is not `from`, it must be approved to move this token by
  * either {approve} or {setApprovalForAll}. 
  * The key manager will be reset to address zero after the transfer
  */
  function transferFrom(address from, address to, uint256 tokenId) external;

  /** 
  * Lending a key allows you to transfer the token while retaining the 
  * ownerships right by setting yourself as a key manager first
  * @param from the owner of token to transfer
  * @param to the address that will receive the token
  * @param tokenId the id of the token
  * @notice This function can only called by 1) the key owner when no key manager is set or 2) the key manager.
  * After calling the function, the `_recipent` will be the new owner, and the sender of the tx
  * will become the key manager.
  */
  function lendKey(address from, address to, uint tokenId) external;

  /** 
  * Unlend is called when you have lent a key and want to claim its full ownership back
  * @param _recipient the address that will receive the token ownership
  * @param _tokenId the id of the token
  * @notice Only the key manager of the token can call this function
  */
  function unlendKey(address _recipient, uint _tokenId) external;

  function approve(address to, uint256 tokenId) external;

  /**
  * @notice Get the approved address for a single NFT
  * @dev Throws if `_tokenId` is not a valid NFT.
  * @param _tokenId The NFT to find the approved address for
  * @return operator The approved address for this NFT, or the zero address if there is none
  */
  function getApproved(uint256 _tokenId) external view returns (address operator);

   /**
   * @dev Sets or unsets the approval of a given operator
   * An operator is allowed to transfer all tokens of the sender on their behalf
   * @param _operator operator address to set the approval
   * @param _approved representing the status of the approval to be set
   * @notice disabled when transfers are disabled
   */
  function setApprovalForAll(address _operator, bool _approved) external;

   /**
   * @dev Tells whether an operator is approved by a given keyManager
   * @param _owner owner address which you want to query the approval of
   * @param _operator operator address which you want to query the approval of
   * @return bool whether the given operator is approved by the given owner
   */
  function isApprovedForAll(address _owner, address _operator) external view returns (bool);

  function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;

  function totalSupply() external view returns (uint256);
  function tokenOfOwnerByIndex(address _owner, uint256 index) external view returns (uint256 tokenId);

  function tokenByIndex(uint256 index) external view returns (uint256);

  /**
    * Innherited from Open Zeppelin AccessControl.sol
    */
  function getRoleAdmin(bytes32 role) external view returns (bytes32);
  function grantRole(bytes32 role, address account) external;
  function revokeRole(bytes32 role, address account) external;
  function renounceRole(bytes32 role, address account) external;
  function hasRole(bytes32 role, address account) external view returns (bool);

  /**
    * @notice An ERC-20 style transfer.
    * @param _value sends a token with _value * expirationDuration (the amount of time remaining on a standard purchase).
    * @dev The typical use case would be to call this with _value 1, which is on par with calling `transferFrom`. If the user
    * has more than `expirationDuration` time remaining this may use the `shareKey` function to send some but not all of the token.
    */
  function transfer(
    address _to,
    uint _value
  ) external
    returns (bool success);

  /** `owner()` is provided as an helper to mimick the `Ownable` contract ABI.
    * The `Ownable` logic is used by many 3rd party services to determine
    * contract ownership - e.g. who is allowed to edit metadata on Opensea.
    * 
    * @notice This logic is NOT used internally by the Unlock Protocol and is made 
    * available only as a convenience helper.
    */
  function owner() external view returns (address);
  function setOwner(address account) external;
  function isOwner(address account) external returns (bool);

  /**
  * Migrate data from the previous single owner => key mapping to 
  * the new data structure w multiple tokens.
  * @param _calldata an ABI-encoded representation of the params (v10: the number of records to migrate as `uint`)
  * @dev when all record schemas are sucessfully upgraded, this function will update the `schemaVersion`
  * variable to the latest/current lock version
  */
  function migrate(bytes calldata _calldata) external;

  /**
  * Returns the version number of the data schema currently used by the lock
  * @notice if this is different from `publicLockVersion`, then the ability to purchase, grant
  * or extend keys is disabled.
  * @dev will return 0 if no ;igration has ever been run
  */
  function schemaVersion() external view returns (uint);

  /**
   * Set the schema version to the latest
   * @notice only lock manager call call this
   */
  function updateSchemaVersion() external;

    /**
  * Renew a given token
  * @notice only works for non-free, expiring, ERC20 locks
  * @param _tokenId the ID fo the token to renew
  * @param _referrer the address of the person to be granted UDT
  */
  function renewMembershipFor(
    uint _tokenId,
    address _referrer
  ) external;
}
