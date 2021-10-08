// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// This contract mostly follows the pattern established by openzeppelin in
// openzeppelin/contracts-ethereum-package/contracts/access/roles

import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';

contract MixinLockManagerRole {

  bytes32 public constant LOCK_MANAGER_ROLE = keccak256("LOCK_MANAGER");

  event LockManagerAdded(address indexed account);
  event LockManagerRemoved(address indexed account);

  function _initializeMixinLockManagerRole(address sender) internal {
    if (!isLockManager(sender)) {
      _setupRole(LOCK_MANAGER_ROLE, sender);
    }
  }

  modifier onlyLockManager() {
    require( hasRole(LOCK_MANAGER_ROLE, msg.sender), 'MixinLockManager: caller does not have the LockManager role');
    _;
  }

  function isLockManager(address account) public view returns (bool) {
    return hasRole(LOCK_MANAGER_ROLE, msg.sender);
  }

  function addLockManager(address account) public onlyLockManager {
    grantRole(LOCK_MANAGER_ROLE, account);
    emit LockManagerAdded(account);
  }

  function renounceLockManager() public {
    renounceRole(LOCK_MANAGER_ROLE, msg.sender);
    emit LockManagerRemoved(msg.sender);
  }
}
