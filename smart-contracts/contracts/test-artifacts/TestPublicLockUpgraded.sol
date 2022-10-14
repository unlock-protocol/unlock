// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../PublicLock.sol";
import "../mixins/MixinLockCore.sol";
import "../mixins/MixinKeys.sol";
import "../interfaces/IPublicLock.sol";

contract TestPublicLockUpgraded is MixinLockCore, MixinKeys {

  function initialize(
    address payable _lockCreator,
    uint _expirationDuration,
    address _tokenAddress,
    uint _keyPrice,
    uint _maxNumberOfKeys,
    string calldata //_lockName
  ) public
    initializer()
  {
    MixinFunds._initializeMixinFunds(_tokenAddress);
    MixinLockCore._initializeMixinLockCore(_lockCreator, _expirationDuration, _keyPrice, _maxNumberOfKeys);
  }

  // add a function to try
  function sayHello() external pure returns (string memory) {
    return 'hello world';
  }

  function migrate(bytes calldata) public override {
    schemaVersion = super.publicLockVersion() + 1;
  }
}

interface ITestPublicLockUpgraded is IPublicLock {
  function sayHello() external pure returns (bool);
}