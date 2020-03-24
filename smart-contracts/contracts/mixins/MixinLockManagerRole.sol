pragma solidity 0.5.17;

// This contract mostly follows the pattern established by openzeppelin in
// openzeppelin/contracts-ethereum-package/contracts/access/roles

import '@openzeppelin/contracts-ethereum-package/contracts/access/Roles.sol';


contract MixinLockManagerRole {
  using Roles for Roles.Role;

  event LockManagerAdded(address indexed account);
  event LockManagerRemoved(address indexed account);

  Roles.Role private lockManagers;

  function _initializeMixinLockManagerRole(address sender) internal {
    if (!isLockManager(sender)) {
      lockManagers.add(sender);
    }
  }

  modifier onlyLockManager() {
    require(isLockManager(msg.sender), 'MixinLockManager: caller does not have the LockManager role');
    _;
  }

  function isLockManager(address account) public view returns (bool) {
    return lockManagers.has(account);
  }

  function addLockManager(address account) public onlyLockManager {
    lockManagers.add(account);
    emit LockManagerAdded(account);
  }

  function renounceLockManager() public {
    lockManagers.remove(msg.sender);
    emit LockManagerRemoved(msg.sender);
  }
}
