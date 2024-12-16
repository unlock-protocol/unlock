// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// This contract mostly follows the pattern established by openzeppelin in
// openzeppelin/contracts-ethereum-package/contracts/access/roles

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./MixinErrors.sol";
import "../interfaces/hooks/ILockHasRoleHook.sol";

contract MixinRoles is AccessControlUpgradeable, MixinErrors {
  // roles
  bytes32 internal constant LOCK_MANAGER_ROLE = keccak256("LOCK_MANAGER");
  bytes32 internal constant KEY_GRANTER_ROLE = keccak256("KEY_GRANTER");

  // events
  event LockManagerAdded(address indexed account);
  event LockManagerRemoved(address indexed account);
  event KeyGranterAdded(address indexed account);
  event KeyGranterRemoved(address indexed account);

  // one more hook (added to v15)
  ILockHasRoleHook public onHasRoleHook;

  // initializer
  function _initializeMixinRoles(address sender) internal {
    // for admin mamangers to add other lock admins
    _setRoleAdmin(LOCK_MANAGER_ROLE, LOCK_MANAGER_ROLE);

    // for lock managers to add/remove key granters
    _setRoleAdmin(KEY_GRANTER_ROLE, LOCK_MANAGER_ROLE);

    if (!isLockManager(sender)) {
      _setupRole(LOCK_MANAGER_ROLE, sender);
    }
    if (!hasRole(KEY_GRANTER_ROLE, sender)) {
      _setupRole(KEY_GRANTER_ROLE, sender);
    }
  }

  function hasRole(
    bytes32 role,
    address account
  ) public view override returns (bool) {
    bool nativeRole = super.hasRole(role, account);
    if (address(onHasRoleHook) != address(0)) {
      return onHasRoleHook.hasRole(role, account, nativeRole);
    }
    return nativeRole;
  }

  // modifiers
  function _onlyLockManager() internal view {
    if (!hasRole(LOCK_MANAGER_ROLE, msg.sender)) {
      revert ONLY_LOCK_MANAGER();
    }
  }

  // lock manager functions
  function isLockManager(address account) public view returns (bool) {
    return hasRole(LOCK_MANAGER_ROLE, account);
  }

  // kept for backward compat with Unlock prior v14
  function renounceLockManager() public {
    renounceRole(LOCK_MANAGER_ROLE, msg.sender);
  }

  // added -1 slot for the onRoleHook address in v15
  uint256[999] private __safe_upgrade_gap;
}
