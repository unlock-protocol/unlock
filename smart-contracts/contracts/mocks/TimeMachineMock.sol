pragma solidity ^0.5.0;

import '../PublicLock.sol';

contract TimeMachineMock is
  PublicLock
{
  /**
  * @notice Modify the expirationTimestamp of a key
  * by a given amount.
  * @param _owner The owner of the key to modify
  * @param _deltaT The amount of time in seconds by which
  * to modify the keys expirationTimestamp
  * @param _addTime Choose whether to increase or decrease
  * expirationTimestamp (false == decrease, true == increase)
  * @dev Throws if owner does not have a valid key.
  */
  function timeMachine(
    address _owner,
    uint256 _deltaT,
    bool _addTime
  ) public
  {
    _timeMachine(_owner, _deltaT, _addTime);
  }
}