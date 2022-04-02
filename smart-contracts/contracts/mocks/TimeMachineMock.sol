// SPDX-License-Identifier: MIT
pragma solidity >=0.5.17 <=0.8.7;

import '../mixins/MixinKeys.sol';

contract TimeMachineMock is
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

  function timeMachine(
    uint _tokenId,
    uint256 _deltaT,
    bool _addTime
  ) public
  {
    _timeMachine(_tokenId, _deltaT, _addTime);
  }
}