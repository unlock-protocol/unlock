// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MixinLockCore.sol";
import "./MixinErrors.sol";
import "../interfaces/IUnlock.sol";

/**
 * @title Mixin for managing `Key` data, as well as the * Approval related functions needed to meet the ERC721
 * standard.
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinKeys is MixinErrors, MixinLockCore {
  // The struct for a key
  struct Key {
    uint tokenId;
    uint expirationTimestamp;
  }

  // Emitted when the Lock owner expires a user's Key
  event ExpireKey(uint indexed tokenId);

  // Emitted when the expiration of a key is modified
  event ExpirationChanged(
    uint indexed tokenId,
    uint newExpiration,
    uint amount,
    bool timeAdded
  );

  // fire when a key is extended
  event KeyExtended(uint indexed tokenId, uint newTimestamp);

  event KeyManagerChanged(uint indexed _tokenId, address indexed _newManager);

  event KeysMigrated(uint updatedRecordsCount);

  event LockConfig(
    uint expirationDuration,
    uint maxNumberOfKeys,
    uint maxKeysPerAcccount
  );

  // Deprecated: don't use this anymore as we know enable multiple keys per owner.
  mapping(address => Key) internal keyByOwner;

  // Each tokenId can have at most exactly one owner at a time.
  // Returns address(0) if the token does not exist
  mapping(uint => address) internal _ownerOf;

  // Keep track of the total number of unique owners for this lock (both expired and valid).
  // This may be larger than totalSupply
  uint public numberOfOwners;

  // A given key has both an owner and a manager.
  // If keyManager == address(0) then the key owner is also the manager
  // Each key can have at most 1 keyManager.
  mapping(uint => address) public keyManagerOf;

  // Keeping track of approved transfers
  // This is a mapping of addresses which have approved
  // the transfer of a key to another address where their key can be transferred
  // Note: the approver may actually NOT have a key... and there can only
  // be a single approved address
  mapping(uint => address) internal approved;

  // Keeping track of approved operators for a given Key manager.
  // This approves a given operator for all keys managed by the calling "keyManager"
  // The caller may not currently be the keyManager for ANY keys.
  // These approvals are never reset/revoked automatically, unlike "approved",
  // which is reset on transfer.
  mapping(address => mapping(address => bool))
    internal managerToOperatorApproved;

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
  function _onlyKeyManagerOrApproved(uint _tokenId) internal view {
    address realKeyManager = keyManagerOf[_tokenId] == address(0)
      ? _ownerOf[_tokenId]
      : keyManagerOf[_tokenId];
    if (
      !isLockManager(msg.sender) &&
      !_isKeyManager(_tokenId, msg.sender) &&
      approved[_tokenId] != msg.sender &&
      !isApprovedForAll(realKeyManager, msg.sender)
    ) {
      revert ONLY_KEY_MANAGER_OR_APPROVED();
    }
  }

  /**
   * Check if a key is expired or not
   * @dev This is a modifier
   */
  function _isValidKey(uint _tokenId) internal view {
    if (!isValidKey(_tokenId)) {
      revert KEY_NOT_VALID();
    }
  }

  /**
   * Check if a key actually exists
   * @dev This is a modifier
   */
  function _isKey(uint _tokenId) internal view {
    if (_keys[_tokenId].tokenId == 0) {
      revert NO_SUCH_KEY();
    }
  }

  /**
   * Migrate data from the previous single owner => key mapping to
   * the new data structure w multiple tokens.
   */
  function migrate(bytes calldata /*_calldata*/) public virtual {
    // make sure we have correct data version before migrating
    require(
      ((schemaVersion == publicLockVersion() - 1) || schemaVersion == 0),
      "SCHEMA_VERSION_NOT_CORRECT"
    );

    // only for mainnet
    if (block.chainid == 1) {
      // Hardcoded address for the redeployed Unlock contract on mainnet
      address newUnlockAddress = 0xe79B93f8E22676774F2A8dAd469175ebd00029FA;

      // trigger migration from the new Unlock
      IUnlock(newUnlockAddress).postLockUpgrade();

      // update unlock ref in this lock
      unlockProtocol = IUnlock(newUnlockAddress);
    }

    // update data version
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
   * @dev Throws if `_index` >= `totalKeys(_keyOwner)` or if
   *  `_keyOwner` is the zero address, representing invalid keys.
   * @param _keyOwner address of the owner
   * @param _index position index in the array of all keys - less than `totalKeys(_keyOwner)`
   * @return The token identifier for the `_index`th key assigned to `_keyOwner`,
   *   (sort order not specified)
   * NB: name kept to be ERC721 compatible
   */
  function tokenOfOwnerByIndex(
    address _keyOwner,
    uint256 _index
  ) public view returns (uint256) {
    if (_index >= totalKeys(_keyOwner)) {
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
  ) internal returns (uint tokenId) {
    if (_recipient == address(0)) {
      revert INVALID_ADDRESS();
    }

    // We increment the tokenId counter
    unchecked {
      _totalSupply++;
    }
    tokenId = _totalSupply;

    // create the key
    _keys[tokenId] = Key(tokenId, expirationTimestamp);

    // increase total number of unique owners
    if (totalKeys(_recipient) == 0) {
      unchecked {
        numberOfOwners++;
      }
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
    uint _tokenId,
    uint _duration
  ) internal returns (uint newTimestamp) {
    uint expirationTimestamp = _keys[_tokenId].expirationTimestamp;

    // prevent extending a valid non-expiring key
    if (expirationTimestamp == type(uint).max) {
      revert CANT_EXTEND_NON_EXPIRING_KEY();
    }

    // if non-expiring but not valid then extend
    uint duration = _duration == 0 ? expirationDuration : _duration;
    if (duration == type(uint).max) {
      newTimestamp = type(uint).max;
    } else {
      if (expirationTimestamp > block.timestamp) {
        // extends a valid key
        newTimestamp = expirationTimestamp + duration;
      } else {
        // renew an expired or cancelled key
        newTimestamp = block.timestamp + duration;
      }
    }

    _keys[_tokenId].expirationTimestamp = newTimestamp;

    emit KeyExtended(_tokenId, newTimestamp);

    // call the hook
    if (address(onKeyExtendHook) != address(0)) {
      onKeyExtendHook.onKeyExtend(
        _tokenId,
        msg.sender,
        newTimestamp,
        expirationTimestamp
      );
    }
  }

  /**
   * Record ownership info and udpate balance for new owner
   * @param _tokenId the id of the token to cancel
   * @param _recipient the address of the new owner
   */
  function _createOwnershipRecord(uint _tokenId, address _recipient) internal {
    uint length = totalKeys(_recipient);

    // make sure address does not have more keys than allowed
    if (length >= _maxKeysPerAddress) {
      revert MAX_KEYS_REACHED();
    }

    // record new owner
    _ownedKeysIndex[_tokenId] = length;
    _ownedKeyIds[_recipient][length] = _tokenId;

    // update ownership mapping
    _ownerOf[_tokenId] = _recipient;
    unchecked {
      _balances[_recipient] += 1;
    }
  }

  /**
   * Merge existing keys
   * @param _tokenIdFrom the id of the token to substract time from
   * @param _tokenIdTo the id of the destination token  to add time
   * @param _amount the amount of time to transfer (in seconds)
   */
  function mergeKeys(uint _tokenIdFrom, uint _tokenIdTo, uint _amount) public {
    // checks
    _isKey(_tokenIdFrom);
    _isValidKey(_tokenIdFrom);
    _onlyKeyManagerOrApproved(_tokenIdFrom);
    _isKey(_tokenIdTo);

    // make sure there is enough time remaining
    if (_amount > keyExpirationTimestampFor(_tokenIdFrom) - block.timestamp) {
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
  function _deleteOwnershipRecord(uint _tokenId) internal {
    // get owner
    address previousOwner = _ownerOf[_tokenId];

    // delete previous ownership
    uint lastTokenIndex = totalKeys(previousOwner) - 1;
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
    if (totalKeys(previousOwner) == 1) {
      unchecked {
        numberOfOwners--;
      }
    }
    // update balance
    _balances[previousOwner] -= 1;
  }

  /**
   * Internal logic to expire the key
   * @param _tokenId the id of the token to cancel
   * @notice this won't 'burn' the token, as it would still exist in the record
   */
  function _cancelKey(uint _tokenId) internal {
    // expire the key
    _keys[_tokenId].expirationTimestamp = block.timestamp;
  }

  /**
   * @return The number of keys owned by `_keyOwner` (expired or not)
   */
  function totalKeys(address _keyOwner) public view returns (uint) {
    return _balances[_keyOwner];
  }

  /**
   * In the specific case of a Lock, `balanceOf` returns only the tokens with a valid expiration timerange
   * @return balance The number of valid keys owned by `_keyOwner`
   */
  function balanceOf(address _keyOwner) public view returns (uint balance) {
    uint length = totalKeys(_keyOwner);
    for (uint i; i < length; ) {
      if (isValidKey(tokenOfOwnerByIndex(_keyOwner, i))) {
        unchecked {
          balance++;
        }
      }
      unchecked {
        i++;
      }
    }
  }

  /**
   * Check if a certain key is valid
   * @param _tokenId the id of the key to check validity
   * @notice this makes use of the onValidKeyHook if it is set
   */
  function isValidKey(uint _tokenId) public view returns (bool) {
    bool isValid = _keys[_tokenId].expirationTimestamp > block.timestamp;

    // use hook if it exists
    if (address(onValidKeyHook) != address(0)) {
      isValid = onValidKeyHook.isValidKey(
        address(this),
        msg.sender,
        _tokenId,
        _keys[_tokenId].expirationTimestamp,
        _ownerOf[_tokenId],
        isValid
      );
    }
    return isValid;
  }

  /**
   * Checks if the user has at least one non-expired key.
   * @param _keyOwner the
   */
  function getHasValidKey(
    address _keyOwner
  ) public view returns (bool isValid) {
    // check hook directly with address if user has no valid keys
    if (balanceOf(_keyOwner) == 0) {
      if (address(onValidKeyHook) != address(0)) {
        return
          onValidKeyHook.isValidKey(
            address(this),
            msg.sender,
            0, // no token specified
            0, // no token specified
            _keyOwner,
            false
          );
      }
    }
    // `balanceOf` returns only valid keys
    return balanceOf(_keyOwner) >= 1;
  }

  /**
   * Returns the key's ExpirationTimestamp field for a given token.
   * @param _tokenId the tokenId of the key
   * @dev Returns 0 if the owner has never owned a key for this lock
   */
  function keyExpirationTimestampFor(uint _tokenId) public view returns (uint) {
    return _keys[_tokenId].expirationTimestamp;
  }

  /**
   *  Returns the owner of a given tokenId
   * @param _tokenId the id of the token
   * @return the address of the owner
   */
  function ownerOf(uint _tokenId) public view returns (address) {
    return _ownerOf[_tokenId];
  }

  /**
   * @notice Public function for setting the manager for a given key
   * @param _tokenId The id of the key to assign rights for
   * @param _keyManager the address with the manager's rights for the given key.
   * Setting _keyManager to address(0) means the keyOwner is also the keyManager
   */
  function setKeyManagerOf(uint _tokenId, address _keyManager) public {
    _isKey(_tokenId);
    if (
      // is already key manager
      !_isKeyManager(_tokenId, msg.sender) &&
      // is lock manager
      !isLockManager(msg.sender)
    ) {
      revert UNAUTHORIZED_KEY_MANAGER_UPDATE();
    }
    _setKeyManagerOf(_tokenId, _keyManager);
  }

  function _setKeyManagerOf(uint _tokenId, address _keyManager) internal {
    if (keyManagerOf[_tokenId] != _keyManager) {
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
  function approve(address _approved, uint _tokenId) public {
    _onlyKeyManagerOrApproved(_tokenId);
    if (msg.sender == _approved) {
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
  function getApproved(uint _tokenId) public view returns (address) {
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
  ) public view returns (bool) {
    return managerToOperatorApproved[_owner][_operator];
  }

  /**
   * Returns true if _keyManager is explicitly set as key manager, or if the
   * address is the owner but no km is set.
   * identified by _tokenId
   */
  function _isKeyManager(
    uint _tokenId,
    address _keyManager
  ) internal view returns (bool) {
    if (
      // is explicitely a key manager
      keyManagerOf[_tokenId] == _keyManager ||
      // is owner and no key manager is set
      ((ownerOf(_tokenId) == _keyManager) &&
        keyManagerOf[_tokenId] == address(0))
    ) {
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
  ) internal {
    _isKey(_tokenId);

    uint formerTimestamp = _keys[_tokenId].expirationTimestamp;

    if (_addTime) {
      if (formerTimestamp > block.timestamp) {
        // append to valid key
        _keys[_tokenId].expirationTimestamp = formerTimestamp + _deltaT;
      } else {
        // add from now if key is expired
        _keys[_tokenId].expirationTimestamp = block.timestamp + _deltaT;
      }
    } else {
      _keys[_tokenId].expirationTimestamp = formerTimestamp - _deltaT;
    }

    emit ExpirationChanged(
      _tokenId,
      _keys[_tokenId].expirationTimestamp,
      _deltaT,
      _addTime
    );
  }

  /**
   * @dev Function to clear current approval of a given token ID
   * @param _tokenId uint256 ID of the token to be transferred
   */
  function _clearApproval(uint256 _tokenId) internal {
    if (approved[_tokenId] != address(0)) {
      approved[_tokenId] = address(0);
    }
  }

  /**
   * Update the main key properties for the entire lock:
   * - default duration of each key
   * - the maximum number of keys the lock can edit
   * - the maximum number of keys a single address can hold
   * @notice keys previously bought are unaffected by this changes in expiration duration (i.e.
   * existing keys timestamps are not recalculated/updated)
   * @param _newExpirationDuration the new amount of time for each key purchased or type(uint).max for a non-expiring key
   * @param _maxKeysPerAcccount the maximum amount of key a single user can own
   * @param _maxNumberOfKeys uint the maximum number of keys
   * @dev _maxNumberOfKeys Can't be smaller than the existing supply
   */
  function updateLockConfig(
    uint _newExpirationDuration,
    uint _maxNumberOfKeys,
    uint _maxKeysPerAcccount
  ) external {
    _onlyLockManager();
    if (_maxKeysPerAcccount == 0) {
      revert NULL_VALUE();
    }
    if (_maxNumberOfKeys < _totalSupply) {
      revert CANT_BE_SMALLER_THAN_SUPPLY();
    }
    _maxKeysPerAddress = _maxKeysPerAcccount;
    expirationDuration = _newExpirationDuration;
    maxNumberOfKeys = _maxNumberOfKeys;

    emit LockConfig(
      _newExpirationDuration,
      _maxNumberOfKeys,
      _maxKeysPerAddress
    );
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
