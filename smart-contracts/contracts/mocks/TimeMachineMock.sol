pragma solidity ^0.5.0;

import '../PublicLock.sol';

contract TimeMachineMock is
  PublicLock
{
  function timeMachine(
    uint _tokenId,
    uint256 _deltaT,
    bool _addTime
  ) public
  {
    _timeMachine(_tokenId, _deltaT, _addTime);
  }
}