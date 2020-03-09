pragma solidity ^0.5.0;

import '../PublicLock.sol';

contract ResetKeyManagerMock is
  PublicLock
{
  function resetKeyManagerOf(
    uint _tokenId
  ) public
  {
    _resetKeyManagerOf(_tokenId);
  }

}