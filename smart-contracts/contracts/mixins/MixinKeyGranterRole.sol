pragma solidity 0.5.17;

// This contract mostly follows the pattern established by openzeppelin in
// openzeppelin/contracts-ethereum-package/contracts/access/roles

import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import './MixinLockManagerRole.sol';


contract MixinKeyGranterRole is MixinLockManagerRole {

  bytes32 public constant KEY_GRANTER_ROLE = keccak256("KEY_GRANTER");

  event KeyGranterAdded(address indexed account);
  event KeyGranterRemoved(address indexed account);

  function _initializeMixinKeyGranterRole(address sender) internal {
    if (!isKeyGranter(sender)) {
      _setupRole(KEY_GRANTER_ROLE, sender);
    }
  }

  modifier onlyKeyGranterOrManager() {
    require(isKeyGranter(msg.sender) || isLockManager(msg.sender), 'MixinKeyGranter: caller does not have the KeyGranter or LockManager role');
    _;
  }

  function isKeyGranter(address account) public view returns (bool) {
    return hasRole(KEY_GRANTER_ROLE, account);
  }

  function addKeyGranter(address account) public onlyLockManager {
    grantRole(KEY_GRANTER_ROLE, account);
    emit KeyGranterAdded(account);
  }

  function revokeKeyGranter(address _granter) public onlyLockManager {
    renounceRole(KEY_GRANTER_ROLE, _granter);
    emit KeyGranterRemoved(_granter);
  }
}
