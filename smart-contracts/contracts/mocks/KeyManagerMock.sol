// SPDX-License-Identifier: MIT
pragma solidity >=0.5.17 <=0.8.7;


import '../mixins/MixinKeys.sol';

contract KeyManagerMock is
  MixinKeys
{
  constructor() {
   _maxKeysPerAddress = 100;
  }

  // returns tokenId
  function createNewKey(
    address _recipient,
    address _keyManager,
    uint _expirationTimestamp
  ) public returns (uint) {
    return _createNewKey(_recipient, _keyManager, _expirationTimestamp);
  }

  function isKeyManager(
    uint _tokenId,
    address _keyManager
  ) external view
    returns (bool)
  {
    return(_isKeyManager(_tokenId, _keyManager));
  }

}