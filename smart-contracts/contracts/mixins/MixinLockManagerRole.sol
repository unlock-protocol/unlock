pragma solidity ^0.5.0;

import '@openzeppelin/upgrades/contracts/Initializable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/access/Roles.sol';


contract MixinLockManagerRole {
  using Roles for Roles.Role;

  event LockManagerAdded(address indexed account);
  event LockManagerRemoved(address indexed account);

  Roles.Role private lockManagers;

  function _initializeMixinLockManagerRole(address sender) internal {
    if (!isLockManager(sender)) {
      _addLockManager(sender);
    }
  }

  modifier onlyLockManager() {
    require(isLockManager(msg.sender), 'MixinLockManager: caller does not have the LockManager role');
    _;
  }

  function isLockManager(address account) public view returns (bool) {
    return _LockManagers.has(account);
  }

  function addLockManager(address account) public onlyLockManager {
    _addLockManager(account);
  }

  function renounceLockManager() public {
    _removeLockManager(msg.sender);
  }

  function _addLockManager(address account) internal {
    _LockManagers.add(account);
    emit LockManagerAdded(account);
  }

  function _removeLockManager(address account) internal {
    _LockManagers.remove(account);
    emit LockManagerRemoved(account);
  }
}
