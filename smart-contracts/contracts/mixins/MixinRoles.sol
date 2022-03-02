// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// This contract mostly follows the pattern established by openzeppelin in
// openzeppelin/contracts-ethereum-package/contracts/access/roles

import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';

contract MixinRoles is AccessControlUpgradeable {

  // roles
  bytes32 public constant LOCK_MANAGER_ROLE = keccak256("LOCK_MANAGER");
  bytes32 public constant KEY_GRANTER_ROLE = keccak256("KEY_GRANTER");

  // used for `owner()`convenience helper
  address private _convenienceOwner;

  // events
  event LockManagerAdded(address indexed account);
  event LockManagerRemoved(address indexed account);
  event KeyGranterAdded(address indexed account);
  event KeyGranterRemoved(address indexed account);
  event OwnershipTransferred(address previousOwner, address newOwner);

  // initializer
  function _initializeMixinRoles(address sender) internal {

    // for admin mamangers to add other lock admins
    _setRoleAdmin(LOCK_MANAGER_ROLE, LOCK_MANAGER_ROLE);

    // for lock managers to add/remove key granters
    _setRoleAdmin(KEY_GRANTER_ROLE, LOCK_MANAGER_ROLE);

    if (!isLockManager(sender)) {
      _setupRole(LOCK_MANAGER_ROLE, sender);  
    }
    if (!isKeyGranter(sender)) {
      _setupRole(KEY_GRANTER_ROLE, sender);
    }

    _convenienceOwner = sender;
  }

  // modifiers
  modifier onlyLockManager() {
    require( hasRole(LOCK_MANAGER_ROLE, msg.sender), 'MixinRoles: caller does not have the LockManager role');
    _;
  }

  modifier onlyKeyGranterOrManager() {
    require(isKeyGranter(msg.sender) || isLockManager(msg.sender), 'MixinRoles: caller does not have the KeyGranter or LockManager role');
    _;
  }


  // lock manager functions
  function isLockManager(address account) public view returns (bool) {
    return hasRole(LOCK_MANAGER_ROLE, account);
  }

  function addLockManager(address account) public onlyLockManager {
    grantRole(LOCK_MANAGER_ROLE, account);
    emit LockManagerAdded(account);
  }

  function renounceLockManager() public {
    renounceRole(LOCK_MANAGER_ROLE, msg.sender);
    emit LockManagerRemoved(msg.sender);
  }


  // key granter functions
  function isKeyGranter(address account) public view returns (bool) {
    return hasRole(KEY_GRANTER_ROLE, account);
  }

  function addKeyGranter(address account) public onlyLockManager {
    grantRole(KEY_GRANTER_ROLE, account);
    emit KeyGranterAdded(account);
  }

  function revokeKeyGranter(address _granter) public onlyLockManager {
    revokeRole(KEY_GRANTER_ROLE, _granter);
    emit KeyGranterRemoved(_granter);
  }


  /** `owner()` is provided as an helper to mimick the `Ownable` contract ABI.
    * The `Ownable` logic is used by many 3rd party services to determine
    * contract ownership - e.g. who is allowed to edit metadata on Opensea.
    * 
    * @notice This logic is NOT used internally by the Unlock Protocol and is made 
    * available only as a convenience helper.
   */
  function owner() public view returns (address) {
    return _convenienceOwner;
  }

  /** Setter for the `owner` convenience helper (see `owner()` docstring for more).
    * @notice This logic is NOT used internally by the Unlock Protocol ans is made 
    * available only as a convenience helper.
    * @param account address returned by the `owner()` helper
   */ 
  function setOwner(address account) public onlyLockManager {
    require(account != address(0), 'OWNER_CANT_BE_ADDRESS_ZERO');
    address _previousOwner = _convenienceOwner;
    _convenienceOwner = account;
    emit OwnershipTransferred(_previousOwner, account);
  }

  function isOwner(address account) public view returns (bool) {
    return _convenienceOwner == account;
  }

  uint256[1000] private __safe_upgrade_gap;
}
