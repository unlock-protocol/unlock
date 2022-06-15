// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './MixinLockCore.sol';
import './MixinErrors.sol';

/**
 * @title Mixin for managing `Key` data, as well as the * Approval related functions needed to meet the ERC721
 * standard.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinKeys is
  MixinErrors,
  MixinLockCore
{
  // The struct for a key
  struct Key {
    uint tokenId;
    uint expirationTimestamp;
  }

  // Emitted when the Lock owner expires a user's Key
  event ExpireKey(uint indexed tokenId);

  // Emitted when the expiration of a key is modified
  event ExpirationChanged(
    uint indexed _tokenId,
    uint _amount,
    bool _timeAdded
  );

  // fire when a key is extended
  event KeyExtended(
    uint indexed tokenId,
    uint newTimestamp
  );

  
  event KeyManagerChanged(uint indexed _tokenId, address indexed _newManager);

  event KeysMigrated(
    uint updatedRecordsCount
  );

  // Deprecated: don't use this anymore as we know enable multiple keys per owner.
  mapping (address => Key) internal keyByOwner;

  // Each tokenId can have at most exactly one owner at a time.
  // Returns address(0) if the token does not exist
  mapping (uint => address) internal _ownerOf;

  // Keep track of the total number of unique owners for this lock (both expired and valid).
  // This may be larger than totalSupply
  uint public numberOfOwners;

  // A given key has both an owner and a manager.
  // If keyManager == address(0) then the key owner is also the manager
  // Each key can have at most 1 keyManager.
  mapping (uint => address) public keyManagerOf;

  // Keeping track of approved transfers
  // This is a mapping of addresses which have approved
  // the transfer of a key to another address where their key can be transferred
  // Note: the approver may actually NOT have a key... and there can only
  // be a single approved address
  mapping (uint => address) internal approved;

  // Keeping track of approved operators for a given Key manager.
  // This approves a given operator for all keys managed by the calling "keyManager"
  // The caller may not currently be the keyManager for ANY keys.
  // These approvals are never reset/revoked automatically, unlike "approved",
  // which is reset on transfer.
  mapping (address => mapping (address => bool)) internal managerToOperatorApproved;

  // store all keys: tokenId => token
  mapping(uint256 => Key) internal _keys;
  
  // store ownership: owner => array of tokens owned by that owner
  mapping(address => mapping(uint256 => uint256)) private _ownedKeyIds;
  
  // store indexes: owner => list of tokenIds
  mapping(uint256 => uint256) private _ownedKeysIndex;

  // Mapping owner address to token count
  mapping(address => uint256) private _balances;
  
  /** 
   * Ensure that the caller is the keyManager of the key
   * or that the caller has been approved
   * for ownership of that key
   * @dev This is a modifier
   */ 
  function _onlyKeyManagerOrApproved(
    uint _tokenId
  )
  internal
  view
  {
    if(
      !_isKeyManager(_tokenId, msg.sender)
      && approved[_tokenId] != msg.sender
      && !isApprovedForAll(_ownerOf[_tokenId], msg.sender)
    ) {
      revert ONLY_KEY_MANAGER_OR_APPROVED();
    }
  }

  /**
   * Check if a key is expired or not
   * @dev This is a modifier
   */
  function _isValidKey(
    uint _tokenId
  ) 
  internal
  view
  {
    if(!isValidKey(_tokenId)) {
      revert KEY_NOT_VALID();
    }
    
  }

  /**
   * Check if a key actually exists
   * @dev This is a modifier
   */
  function _isKey(
    uint _tokenId
  ) 
  internal
  view 
  {
    if(_keys[_tokenId].expirationTimestamp == 0) {
      revert NO_SUCH_KEY();
    }
  }

  /**
   * Deactivate an existing key
   * @param _tokenId the id of token to burn
   * @notice the key will be expired and ownership records will be destroyed
   */
  function burn(uint _tokenId) public {
    _isKey(_tokenId);
    _onlyKeyManagerOrApproved(_tokenId);

    emit Transfer(_ownerOf[_tokenId], address(0), _tokenId);

    // delete ownership and expire key
    _cancelKey(_tokenId);
  }

  /**
    * Migrate data from the previous single owner => key mapping to 
    * the new data structure w multiple tokens.
    * No data migration needed for v10 > v11
    */
  function migrate(bytes calldata) virtual public {
    schemaVersion = publicLockVersion();
  }

  /**
   * Set the schema version to the latest
   * @notice only lock manager call call this
   */
  function updateSchemaVersion() public {
    _onlyLockManager();
    schemaVersion = publicLockVersion();
  }

  /**
    * Returns the id of a key for a specific owner at a specific index
    * @notice Enumerate keys assigned to an owner
    * @dev Throws if `_index` >= `balanceOf(_keyOwner)` or if
    *  `_keyOwner` is the zero address, representing invalid keys.
    * @param _keyOwner address of the owner
    * @param _index position index in the array of all keys - less than `balanceOf(_keyOwner)`
    * @return The token identifier for the `_index`th key assigned to `_keyOwner`,
    *   (sort order not specified)
    * NB: name kept to be ERC721 compatible
    */
  function tokenOfOwnerByIndex(
    address _keyOwner,
    uint256 _index
  ) 
    public 
    view
    returns (uint256)
  {
      if(_index >= totalKeys(_keyOwner)) {
        revert OUT_OF_RANGE();
      }
      return _ownedKeyIds[_keyOwner][_index];
  }

  /**
   * Create a new key with a new tokenId and store it 
   * 
   */
  function _createNewKey(
    address _recipient,
    address _keyManager,
    uint expirationTimestamp
  ) 
  internal 
  returns (uint tokenId) {

    if(_recipient == address(0)) { 
        revert INVALID_ADDRESS();
    }
    
    // We increment the tokenId counter
    _totalSupply++;
    tokenId = _totalSupply;

    // create the key
    _keys[tokenId] = Key(tokenId, expirationTimestamp);
    
    // increase total number of unique owners
    if(totalKeys(_recipient) == 0 ) {
      numberOfOwners++;
    }

    // store ownership
    _createOwnershipRecord(tokenId, _recipient);

    // set key manager
    _setKeyManagerOf(tokenId, _keyManager);

    // trigger event
    emit Transfer(
      address(0), // This is a creation.
      _recipient,
      tokenId
    );
  }

  function _extendKey(
    uint _tokenId
  ) internal 
    returns (
      uint newTimestamp
    )
  {
    uint expirationTimestamp = _keys[_tokenId].expirationTimestamp;

    // prevent extending a valid non-expiring key
    if(expirationTimestamp == type(uint).max){
      revert CANT_EXTEND_NON_EXPIRING_KEY();
    }
    
    // if non-expiring but not valid then extend
    if(expirationDuration == type(uint).max) {
      newTimestamp = type(uint).max;
    } else {
      if (expirationTimestamp > block.timestamp) {
        // extends a valid key  
        newTimestamp = expirationTimestamp + expirationDuration;
      } else {
        // renew an expired or cancelled key
        newTimestamp = block.timestamp + expirationDuration;
      }
    }

    _keys[_tokenId].expirationTimestamp = newTimestamp;

    emit KeyExtended(_tokenId, newTimestamp);
  } 

  /**
   * Record ownership info and udpate balance for new owner
   * @param _tokenId the id of the token to cancel
   * @param _recipient the address of the new owner
   */
  function _createOwnershipRecord(
   uint _tokenId,
   address _recipient
  ) internal { 
    uint length = balanceOf(_recipient);
    
    // make sure address does not have more keys than allowed
    if(length >= _maxKeysPerAddress) {
      revert MAX_KEYS_REACHED();
    }

    // record new owner
    _ownedKeysIndex[_tokenId] = length;
    _ownedKeyIds[_recipient][length] = _tokenId;

    // update ownership mapping
    _ownerOf[_tokenId] = _recipient;
    _balances[_recipient] += 1;
  }

  /**
   * Merge existing keys
   * @param _tokenIdFrom the id of the token to substract time from
   * @param _tokenIdTo the id of the destination token  to add time
   * @param _amount the amount of time to transfer (in seconds)
   */
  function mergeKeys(
    uint _tokenIdFrom, 
    uint _tokenIdTo, 
    uint _amount
    ) public {

    // checks
    _isKey(_tokenIdFrom);
    _isValidKey(_tokenIdFrom);
    _onlyKeyManagerOrApproved(_tokenIdFrom);
    _isKey(_tokenIdTo);
    
    // make sure there is enough time remaining
    if(
      _amount > keyExpirationTimestampFor(_tokenIdFrom) - block.timestamp
    ) {
      revert NOT_ENOUGH_TIME();
    }

    // deduct time from parent key
    _timeMachine(_tokenIdFrom, _amount, false);

    // add time to destination key
    _timeMachine(_tokenIdTo, _amount, true);

  }

  /**
   * Delete ownership info and udpate balance for previous owner
   * @param _tokenId the id of the token to cancel
   */
  function _deleteOwnershipRecord(
    uint _tokenId
  ) internal {
    // get owner
    address previousOwner = _ownerOf[_tokenId];

    // delete previous ownership
    uint lastTokenIndex = balanceOf(previousOwner) - 1;
    uint index = _ownedKeysIndex[_tokenId];

    // When the token to delete is the last token, the swap operation is unnecessary
    if (index != lastTokenIndex) {
        uint256 lastTokenId = _ownedKeyIds[previousOwner][lastTokenIndex];
        _ownedKeyIds[previousOwner][index] = lastTokenId; // Move the last token to the slot of the to-delete token
        _ownedKeysIndex[lastTokenId] = index; // Update the moved token's index
    }

    // Deletes the contents at the last position of the array
    delete _ownedKeyIds[previousOwner][lastTokenIndex];

    // remove from owner count if thats the only key 
    if(totalKeys(previousOwner) == 1 ) {
      numberOfOwners--;
    }
    // update balance
    _balances[previousOwner] -= 1;
  }

  /**
   * Delete ownership info about a key and expire the key
   * @param _tokenId the id of the token to cancel
   * @notice this won't 'burn' the token, as it would still exist in the record
   */
  function _cancelKey(
    uint _tokenId
  ) internal {
    
    // Deletes the contents at the last position of the array
    _deleteOwnershipRecord(_tokenId);

    // expire the key
    _keys[_tokenId].expirationTimestamp = block.timestamp;

    // delete previous owner
    _ownerOf[_tokenId] = address(0);
  }

  /**
   * @return The number of keys owned by `_keyOwner` (expired or not)
  */
  function totalKeys(
    address _keyOwner
  )
    public
    view
    returns (uint)
  {
    if(_keyOwner == address(0)) { 
      revert INVALID_ADDRESS();
    }

    return _balances[_keyOwner];
  }

  /**
   * In the specific case of a Lock, `balanceOf` returns only the tokens with a valid expiration timerange
   * @return balance The number of valid keys owned by `_keyOwner`
  */
  function balanceOf(
    address _keyOwner
  )
    public
    view
    returns (uint balance)
  {
    uint length = totalKeys(_keyOwner);
    for (uint i = 0; i < length; i++) {
      if(isValidKey(tokenOfOwnerByIndex(_keyOwner, i))) {
        balance++;
      }
    }
  }

  /**
   * Check if a certain key is valid
   * @param _tokenId the id of the key to check validity
   * @notice this makes use of the onValidKeyHook if it is set
   */
  function isValidKey(
    uint _tokenId
  )
    public
    view
    returns (bool)
  { 
    bool isValid = _keys[_tokenId].expirationTimestamp > block.timestamp;
    return isValid;
  }   

  /**
   * Checks if the user has at least one non-expired key.
   * @param _keyOwner the 
   */
  function getHasValidKey(
    address _keyOwner
  )
    public
    view
    returns (bool isValid)
  { 
    uint length = balanceOf(_keyOwner);
    if(length > 0) {
      for (uint i = 0; i < length; i++) {
        if(isValidKey(tokenOfOwnerByIndex(_keyOwner, i))) {
          return true; // stop looping at the first valid key
        }
      }
    }

    // use hook if it exists
    if(address(onValidKeyHook) != address(0)) {
      isValid = onValidKeyHook.hasValidKey(
        address(this),
        _keyOwner,
        0, // no timestamp needed (we use tokenId)
        isValid
      );
    }
    return isValid;   
  }

  /**
    * Returns the key's ExpirationTimestamp field for a given token.
    * @param _tokenId the tokenId of the key
    * @dev Returns 0 if the owner has never owned a key for this lock
    */
  function keyExpirationTimestampFor(
    uint _tokenId
  ) public view
    returns (uint)
  {
    return _keys[_tokenId].expirationTimestamp;
  }
 
  /** 
   *  Returns the owner of a given tokenId
   * @param _tokenId the id of the token
   * @return the address of the owner
   */ 
  function ownerOf(
    uint _tokenId
  ) public view
    returns(address)
  {
    return _ownerOf[_tokenId];
  }

  /**
   * @notice Public function for updating transfer and cancel rights for a given key
   * @param _tokenId The id of the key to assign rights for
   * @param _keyManager The address with the manager's rights for the given key.
   * Setting _keyManager to address(0) means the keyOwner is also the keyManager
   */
  function setKeyManagerOf(
    uint _tokenId,
    address _keyManager
  ) public
  {
    _isKey(_tokenId);
    if(
      !_isKeyManager(_tokenId, msg.sender) 
      && !isLockManager(msg.sender)
    ) {
      revert UNAUTHORIZED_KEY_MANAGER_UPDATE();
    }
    _setKeyManagerOf(_tokenId, _keyManager);
  }

  function _setKeyManagerOf(
    uint _tokenId,
    address _keyManager
  ) internal
  {
    if(keyManagerOf[_tokenId] != _keyManager) {
      keyManagerOf[_tokenId] = _keyManager;
      _clearApproval(_tokenId);
      emit KeyManagerChanged(_tokenId, _keyManager);
    }
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
    public
  {
    _onlyKeyManagerOrApproved(_tokenId);
    if(msg.sender == _approved) {
      revert CANNOT_APPROVE_SELF();
    }

    approved[_tokenId] = _approved;
    emit Approval(_ownerOf[_tokenId], _approved, _tokenId);
  }

    /**
   * @notice Get the approved address for a single NFT
   * @dev Throws if `_tokenId` is not a valid NFT.
   * @param _tokenId The NFT to find the approved address for
   * @return The approved address for this NFT, or the zero address if there is none
   */
  function getApproved(
    uint _tokenId
  ) public view
    returns (address)
  {
    _isKey(_tokenId);
    address approvedRecipient = approved[_tokenId];
    return approvedRecipient;
  }

    /**
   * @dev Tells whether an operator is approved by a given keyManager
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
    return managerToOperatorApproved[_owner][_operator];
  }

  /**
   * Returns true if _keyManager is the manager of the key
   * identified by _tokenId
   */
  function _isKeyManager(
    uint _tokenId,
    address _keyManager
  ) internal view
    returns (bool)
  {
    if(keyManagerOf[_tokenId] == _keyManager ||
      (keyManagerOf[_tokenId] == address(0) && ownerOf(_tokenId) == _keyManager)) {
      return true;
    } else {
      return false;
    }
  }

  /**
    * @notice Modify the expirationTimestamp of a key
    * by a given amount.
    * @param _tokenId The ID of the key to modify.
    * @param _deltaT The amount of time in seconds by which
    * to modify the keys expirationTimestamp
    * @param _addTime Choose whether to increase or decrease
    * expirationTimestamp (false == decrease, true == increase)
    * @dev Throws if owner does not have a valid key.
    */
  function _timeMachine(
    uint _tokenId,
    uint256 _deltaT,
    bool _addTime
  ) internal
  {
    _isKey(_tokenId);

    uint formerTimestamp = _keys[_tokenId].expirationTimestamp;

    if(_addTime) {
      if(formerTimestamp > block.timestamp) {
        // append to valid key
        _keys[_tokenId].expirationTimestamp = formerTimestamp + _deltaT;
      } else {
        // add from now if key is expired
        _keys[_tokenId].expirationTimestamp = block.timestamp + _deltaT;
      }
    } else {
        _keys[_tokenId].expirationTimestamp = formerTimestamp - _deltaT;
    }

    emit ExpirationChanged(_tokenId, _deltaT, _addTime);
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

  /**
   * @notice Change the maximum number of keys the lock can edit
   * @param _maxNumberOfKeys uint the maximum number of keys
   * @dev Can't be smaller than the existing supply
   */
  function setMaxNumberOfKeys (uint _maxNumberOfKeys) external {
     _onlyLockManager();
     if (_maxNumberOfKeys < _totalSupply) {
       revert CANT_BE_SMALLER_THAN_SUPPLY();
     }
     maxNumberOfKeys = _maxNumberOfKeys;
  }

  /**
   * A function to change the default duration of each key in the lock
   * @notice keys previously bought are unaffected by this change (i.e.
   * existing keys timestamps are not recalculated/updated)
   * @param _newExpirationDuration the new amount of time for each key purchased 
   * or type(uint).max for a non-expiring key
   */
  function setExpirationDuration(uint _newExpirationDuration) external {
     _onlyLockManager();
     expirationDuration = _newExpirationDuration;
  }
  
  /**
   * Set the maximum number of keys a specific address can use
   * @param _maxKeys the maximum amount of key a user can own
   */
  function setMaxKeysPerAddress(uint _maxKeys) external {
     _onlyLockManager();
     if(_maxKeys == 0) {
       revert NULL_VALUE();
     }
     _maxKeysPerAddress = _maxKeys;
  }

  /**
   * @return the maximum number of key allowed for a single address
   */
  function maxKeysPerAddress() external view returns (uint) {
    return _maxKeysPerAddress;
  }
  
  // decrease 1000 to 996 when adding new tokens/owners mappings in v10
  uint256[996] private __safe_upgrade_gap;
}
