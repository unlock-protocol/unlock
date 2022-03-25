// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './MixinLockCore.sol';

/**
 * @title Mixin for managing `Key` data, as well as the * Approval related functions needed to meet the ERC721
 * standard.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinKeys is
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

  event KeyManagerChanged(uint indexed _tokenId, address indexed _newManager);

  event KeysMigrated(
    uint updatedRecordsCount
  );

  // Deprecated: don't use this anymore as we know enable multiple keys per owner.
  mapping (address => Key) internal keyByOwner;

  // Each tokenId can have at most exactly one owner at a time.
  // Returns 0 if the token does not exist
  // TODO: once we decouple tokenId from owner address (incl in js), then we can consider
  // merging this with totalSupply into an array instead.
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
  mapping (uint => address) private approved;

    // Keeping track of approved operators for a given Key manager.
  // This approves a given operator for all keys managed by the calling "keyManager"
  // The caller may not currently be the keyManager for ANY keys.
  // These approvals are never reset/revoked automatically, unlike "approved",
  // which is reset on transfer.
  mapping (address => mapping (address => bool)) private managerToOperatorApproved;

  // store all keys: tokenId => token
  mapping(uint256 => Key) private _keys;
  
  // store ownership: owner => array of tokens owned by that owner
  mapping(address => mapping(uint256 => uint256)) private _ownedKeyIds;
  
  // store indexes: owner => list of tokenIds
  mapping(uint256 => uint256) private _ownedKeysIndex;

  // Mapping owner address to token count
  mapping(address => uint256) private _balances;

  // Ensure that the caller is the keyManager of the key
  // or that the caller has been approved
  // for ownership of that key
  function _onlyKeyManagerOrApproved(
    uint _tokenId
  )
  internal
  view
  {
    require(
      _isKeyManager(_tokenId, msg.sender) ||
      _isApproved(_tokenId, msg.sender) ||
      isApprovedForAll(_ownerOf[_tokenId], msg.sender),
      'ONLY_KEY_MANAGER_OR_APPROVED'
    );
  }

  // Ensures that an owner has a valid key
  function _hasValidKey(
    address _user
  ) 
  internal 
  view 
  {
    require(
      getHasValidKey(_user), 'KEY_NOT_VALID'
    );
  }

  /**
   * Modifier to check if a key is expired or not
   */
  function _isValidKey(
    uint _tokenId
  ) 
  internal
  view
  {
    require(
      isValidKey(_tokenId),
      'KEY_NOT_VALID'
    );
  }

  // Ensures that a key has an owner
  function _isKey(
    uint _tokenId
  ) 
  internal
  view 
  {
    require(
      _keys[_tokenId].expirationTimestamp != 0, 'NO_SUCH_KEY'
    );
  }


  /**
  * Migrate data from the previous single owner => key mapping to 
  * the new data structure w multiple tokens.
  * @param _calldata an ABI-encoded representation of the params 
  * for v10: `(uint _startIndex, uint nbRecordsToUpdate)`
  * -  `_startIndex` : the index of the first record to migrate
  * -  `_nbRecordsToUpdate` : number of records to migrate
  * @dev if all records can be processed at once, the `schemaVersion` will be updated
  * if not, you will have to call `updateSchemaVersion`
  * variable to the latest/current lock version
  */
  function migrate(
    bytes calldata _calldata
  ) virtual public {
    
    // make sure we have correct data version before migrating
    require(
      (
        (schemaVersion == publicLockVersion() - 1)
        ||
        schemaVersion == 0
      ),
      'SCHEMA_VERSION_NOT_CORRECT'
    );

    // count the records that are actually migrated
    uint startIndex = 0;
    
    // count the records that are actually migrated
    uint updatedRecordsCount;

    // the index of the last record to migrate in this call
    uint nbRecordsToUpdate;

    // the total number of records to migrate
    uint totalSupply = totalSupply();
    
    // default to 100 when sent from Unlock, as this is called by default in the upgrade script.
    // If there are more than 100 keys, the migrate function will need to be called again until all keys have been migrated.
    if( msg.sender == address(unlockProtocol) ) {
      nbRecordsToUpdate = 100;
    } else {
      // decode param
      (startIndex, nbRecordsToUpdate) = abi.decode(_calldata, (uint, uint));
    }

    // cap the number of records to migrate to totalSupply
    if(nbRecordsToUpdate > totalSupply) nbRecordsToUpdate = totalSupply;

    for (uint256 i = startIndex; i < startIndex + nbRecordsToUpdate; i++) {
      // tokenId starts at 1
      uint tokenId = i + 1;
      address keyOwner = _ownerOf[tokenId];
      Key memory k = keyByOwner[keyOwner];

      // make sure key exists
      if(k.tokenId != 0 && k.expirationTimestamp != 0) {

        // copy key in new mapping
        _keys[i + 1] = Key(k.tokenId, k.expirationTimestamp);
        
        // delete token from previous owner
        delete keyByOwner[keyOwner];

        // record new owner
        _ownedKeyIds[keyOwner][0] = tokenId;
        _ownedKeysIndex[tokenId] = 0;

        // update ownership
        _balances[keyOwner] += 1;

        // keep track of updated records
        updatedRecordsCount++;
      }
    }
    
    // enable lock if all keys has been migrated in a single run
    if(nbRecordsToUpdate >= totalSupply) {
      schemaVersion = publicLockVersion();
    }

    emit KeysMigrated(
      updatedRecordsCount // records that have been migrated
    );
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
  * @param _keyOwner address of the owner
  * @param _index position index of the key in the array of all keys owned by owner
  */
  function getKeyOfOwnerByIndex(
    address _keyOwner, 
    uint256 _index
  ) 
    public 
    view 
    returns (uint _tokenId) 
  {
      require(_index < balanceOf(_keyOwner), "OWNER_INDEX_OUT_OF_BOUNDS");
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
    
    // We increment the tokenId counter
    _totalSupply++;
    tokenId = _totalSupply;

    // create the key
    _keys[tokenId] = Key(tokenId, expirationTimestamp);
    
    // store ownership
    uint length = balanceOf(_recipient);
    _ownedKeysIndex[tokenId] = length;
    _ownedKeyIds[_recipient][length] = tokenId;
    _ownerOf[tokenId] = _recipient;

    // increase total number of unique owners
    if(length == 0 ) {
      numberOfOwners++;
    }

    // update balance
    _balances[_recipient] += 1;

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
    require(expirationTimestamp != type(uint).max, 'CANT_EXTEND_NON_EXPIRING_KEY');
    
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
  } 

  /**
   * Transfer a key with a new tokenId and store it 
   * 
   */
  function _transferKey(
    uint _tokenId,
    address _recipient,
    uint expirationTimestamp
  ) internal 
  returns (uint) {
    _isKey(_tokenId);
    address previousOwner = _ownerOf[_tokenId];
    require(previousOwner != _recipient, 'TRANSFER_TO_SELF');

    // update expiration
    Key storage key = _keys[_tokenId];
    key.expirationTimestamp = expirationTimestamp;

    // increase total number of unique owners
    uint length = balanceOf(_recipient);
    if(length == 0 ) {
      numberOfOwners++;
    }

    // delete token from previous owner
    _deleteOwnershipRecord(_tokenId);

    // record new owner
    _ownedKeyIds[_recipient][length] = _tokenId;
    _ownedKeysIndex[_tokenId] = length;

    // update ownership mapping
    _ownerOf[_tokenId] = _recipient;
    _balances[_recipient] += 1;

    return key.tokenId;
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
    if(balanceOf(previousOwner) == 1 ) {
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
  }

  /**
   * In the specific case of a Lock, each owner can own only at most 1 key.
   * @return The number of NFTs owned by `_keyOwner`, either 0 or 1.
  */
  function balanceOf(
    address _keyOwner
  )
    public
    view
    returns (uint)
  {
    require(_keyOwner != address(0), 'INVALID_ADDRESS');
    // uint balance;
    // if (keyByOwner[_keyOwner].expirationTimestamp != 0) {
    //   balance = 1;
    // } 
    // return balance + _balances[_keyOwner];
    return _balances[_keyOwner];
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

    // use hook if it exists
    if(address(onValidKeyHook) != address(0)) {
      isValid = onValidKeyHook.hasValidKey(
        address(this),
        _ownerOf[_tokenId],
        _keys[_tokenId].expirationTimestamp,
        isValid
      );
    }

    return isValid;
  }   

  /**
   * Checks if the user has a non-expired key.
   */
  function getHasValidKey(
    address _keyOwner
  )
    public
    view
    returns (bool)
  { 
    bool isValid = false;
    uint length = balanceOf(_keyOwner);
    if(length > 0) {
      for (uint i = 0; i < length; i++) {
        if(_keys[getKeyOfOwnerByIndex(_keyOwner, i)].expirationTimestamp > block.timestamp) {
          isValid = true;
        }
      }
    }

    // use hook if it exists
    if(address(onValidKeyHook) != address(0)) {
      isValid = onValidKeyHook.hasValidKey(
        address(this),
        _keyOwner,
        0, // pass zero, as we dont use tokenId / expiration anymore
        isValid
      );
    }

    return isValid;   
  }

  /**
  * @dev Returns the key's ExpirationTimestamp field for a given token.
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
  * @dev Set the key's ExpirationTimestamp field for a given token.
  * @param _tokenId the tokenId of the key
  * @param _expirationTimestamp the tokenId of the key
  * @dev Returns 0 if the owner has never owned a key for this lock
  */
  function _setKeyExpirationTimestamp(
    uint _tokenId,
    uint _expirationTimestamp
  ) internal
  {
    _isKey(_tokenId);
    _keys[_tokenId].expirationTimestamp = _expirationTimestamp;
  }

  // Returns the owner of a given tokenId
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
    require(
      _isKeyManager(_tokenId, msg.sender) ||
      isLockManager(msg.sender),
      'UNAUTHORIZED_KEY_MANAGER_UPDATE'
    );
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
    _onlyIfAlive();
    _onlyKeyManagerOrApproved(_tokenId);
    require(msg.sender != _approved, 'APPROVE_SELF');

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
   * @dev Sets or unsets the approval of a given operator
   * An operator is allowed to transfer all tokens of the sender on their behalf
   * @param _to operator address to set the approval
   * @param _approved representing the status of the approval to be set
   */
  function setApprovalForAll(
    address _to,
    bool _approved
  ) public
  {
    _onlyIfAlive();
    require(_to != msg.sender, 'APPROVE_SELF');
    managerToOperatorApproved[msg.sender][_to] = _approved;
    emit ApprovalForAll(msg.sender, _to, _approved);
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
   * @dev Change the maximum number of keys the lock can edit
   * @param _maxNumberOfKeys uint the maximum number of keys
   */
  function setMaxNumberOfKeys (uint _maxNumberOfKeys) external {
     _onlyLockManager();
     require (_maxNumberOfKeys >= _totalSupply, "maxNumberOfKeys is smaller than existing supply");
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
  
  // decrease 1000 to 996 when adding new tokens/owners mappings in v10
  uint256[996] private __safe_upgrade_gap;
}
