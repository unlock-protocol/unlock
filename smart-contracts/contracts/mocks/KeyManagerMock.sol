pragma solidity ^0.5.0;

import '../PublicLock.sol';

contract KeyManagerMock is
  PublicLock
{
  function resetKeyManagerOf(
    uint _tokenId
  ) external
  {
    _resetKeyManagerOf(_tokenId);
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