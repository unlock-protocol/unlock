pragma solidity ^0.5.0;

import '../PublicLock.sol';

contract TimeMachineMock is
  PublicLock
{
  function timeMachine(
    address _owner,
    uint256 _deltaT,
    bool _addTime
  ) public
  {
    _timeMachine(_owner, _deltaT, _addTime);
  }
}