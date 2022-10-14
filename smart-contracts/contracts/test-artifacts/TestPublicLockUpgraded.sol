// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../PublicLock.sol";
import "../mixins/MixinLockCore.sol";
import "../mixins/MixinKeys.sol";
import "../mixins/MixinLockMetadata.sol";
import "../mixins/MixinERC721Enumerable.sol";
import "../mixins/MixinRoles.sol";
import "../interfaces/IPublicLock.sol";
import '@openzeppelin/contracts-upgradeable/utils/introspection/ERC165StorageUpgradeable.sol';

contract TestPublicLockUpgraded is 
  ERC165StorageUpgradeable,
  MixinLockCore, 
  MixinKeys, 
  MixinLockMetadata,
  MixinERC721Enumerable
{

  function initialize(
    address payable _lockCreator,
    uint _expirationDuration,
    address _tokenAddress,
    uint _keyPrice,
    uint _maxNumberOfKeys,
    string calldata _lockName
  ) public
    initializer()
  {
    MixinFunds._initializeMixinFunds(_tokenAddress);
    MixinLockCore._initializeMixinLockCore(_lockCreator, _expirationDuration, _keyPrice, _maxNumberOfKeys);
    MixinLockMetadata._initializeMixinLockMetadata(_lockName);
    MixinERC721Enumerable._initializeMixinERC721Enumerable();
    MixinRoles._initializeMixinRoles(_lockCreator);

    _registerInterface(0x80ac58cd);
  }

  // add a function to try
  function sayHello() external pure returns (string memory) {
    return 'hello world';
  }

  function migrate(bytes calldata) public override {
    schemaVersion = super.publicLockVersion() + 1;
  }

   /**
   Overrides
  */
  function supportsInterface(bytes4 interfaceId) 
    public 
    view 
    virtual 
    override(
      MixinERC721Enumerable,
      MixinLockMetadata,
      AccessControlUpgradeable, 
      ERC165StorageUpgradeable
    ) 
    returns (bool) 
    {
    return super.supportsInterface(interfaceId);
  }
}

interface ITestPublicLockUpgraded is IPublicLock {
  function sayHello() external pure returns (string memory);
}