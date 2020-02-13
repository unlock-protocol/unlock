pragma solidity ^0.5.0;

// This contract mostly follows the pattern established by openzeppelin in
// openzeppelin/contracts-ethereum-package/contracts/access/roles

import '@openzeppelin/upgrades/contracts/Initializable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/access/Roles.sol';
import './MixinLockManagerRole.sol';


contract MixinKeyGranterRole is MixinLockManagerRole {
  using Roles for Roles.Role;

  event KeyGranterAdded(address indexed account);
  event KeyGranterRemoved(address indexed account);

  Roles.Role private keyGranters;

  function _initializeMixinKeyGranterRole(address sender) internal {
    if (!isKeyGranter(sender)) {
      keyGranters.add(sender);
    }
  }

  modifier onlyKeyGranter() {
    require(isKeyGranter(msg.sender), 'MixinKeyGranter: caller does not have the KeyGranter role');
    _;
  }

  function isKeyGranter(address account) public view returns (bool) {
    return keyGranters.has(account);
  }

  function addKeyGranter(address account) public onlyLockManager {
    keyGranters.add(account);
    emit KeyGranterAdded(account);
  }

  function revokeKeyGranter(address _granter) public onlyLockManager {
    keyGranters.remove(_granter);
    emit KeyGranterRemoved(_granter);
  }
}
