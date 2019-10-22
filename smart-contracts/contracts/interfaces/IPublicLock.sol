pragma solidity 0.5.12;


/**
* @title The PublicLock Interface
* @author Nick Furfaro (unlock-protocol.com)
 */

interface IPublicLock {

  // Events
  event Destroy(
    uint balance,
    address indexed owner
  );

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

  event PriceChanged(
    uint oldKeyPrice,
    uint keyPrice
  );

  event ExpireKey(uint indexed tokenId);

  event NewLockSymbol(
    string symbol
  );

  event TransferFeeChanged(
    uint transferFeeBasisPoints
  );

  // Functions

  /**
  * @notice The version number of the current implementation on this network.
  * @return The current version number.
  */
  function publicLockVersion() external pure returns (uint16);

  /**
  * @notice Gets the current balance of the account provided.
  * @param _tokenAddress The token type to retrieve the balance of.
  * @param _account The account to get the balance of.
  * @return The number of tokens of the given type for the given address, possibly 0.
  */
  function getBalance(
    address _tokenAddress,
    address _account
  ) external view
    returns (uint);

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
  function withdraw(
    address _tokenAddress,
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
   * In the specific case of a Lock, each owner can own only at most 1 key.
   * @return The number of NFTs owned by `_owner`, either 0 or 1.
   * @dev Throws if _owner = address(0)
   * @param _owner The address of the key owner
  */
  function balanceOf(
    address _owner
  ) external view returns (uint);

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

  /// @notice Enumerate valid NFTs
  /// @dev Throws if `_index` >= `totalSupply()`.
  /// @param _index A counter less than `totalSupply()`
  /// @return The token identifier for the `_index`th NFT,
  ///  (sort order not specified)
  function tokenByIndex(
    uint256 _index
  ) external view returns (uint256);

  /// @notice Enumerate NFTs assigned to an owner
  /// @dev Throws if `_index` >= `balanceOf(_owner)` or if
  ///  `_owner` is the zero address, representing invalid NFTs.
  /// @param _owner An address where we are interested in NFTs owned by them
  /// @param _index A counter less than `balanceOf(_owner)`
  /// @return The token identifier for the `_index`th NFT assigned to `_owner`,
  ///   (sort order not specified)
  function tokenOfOwnerByIndex(
    address _owner,
    uint256 _index
  ) external view returns (uint256);

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
   * This approves _approved to get ownership of _tokenId.
   * Note: that since this is used for both purchase and transfer approvals
   * the approved token may not exist.
   * @param _approved The address to approve
   * @param _tokenId The tokenId to approve
   * @dev Throws if lock is disabled. Throws if called by other than key owner of =r approved address.
   */
  function approve(
    address _approved,
    uint _tokenId
  ) external payable;

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

  /**
   * Allow the Lock owner to change the transfer fee.
   * @dev Throws if called by other than lock-owner
   * @param _transferFeeBasisPoints The new transfer fee in basis-points(bps).
   * Ex: 200 bps = 2%
   */
  function updateTransferFee(
    uint _transferFeeBasisPoints
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
   * @dev Invoked by the lock owner to destroy the user's key and perform a refund and cancellation of the key
   * @param _keyOwner The key owner to whom we wish to send a refund to
   * @param amount The amount to refund the key-owner
   * @dev Throws if called by other than owner
   * @dev Throws if _keyOwner does not have a valid key
   */
  function fullRefund(
    address _keyOwner,
    uint amount
  ) external;

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
   * @dev Increments the current nonce for the msg.sender.
   * This can be used to invalidate a previously signed message.
   */
  function invalidateApprovalToCancelKey(
  ) external;

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
}