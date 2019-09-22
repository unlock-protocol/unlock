pragma solidity 0.5.11;

import '../interfaces/IUnlockEventHooks.sol';
import './MixinLockCore.sol';
import '@openzeppelin/contracts/introspection/IERC1820Registry.sol';


/**
 * @title Implements callback hooks for Locks.
 * @author Nick Mancuso (unlock-protocol.com)
 */
contract MixinEventHooks is
  MixinLockCore
{
  IERC1820Registry public erc1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);

  // `keccak256("IUnlockEventHooks_keySold")`
  bytes32 public keySoldInterfaceId = 0x4d99da10ff5120f726d35edd8dbd417bbe55d90453b8432acd284e650ee2c6f0;

  /**
   * @dev called anytime a key is sold in order to inform the hook if there is one registered.
   */
  function _onKeySold(
    address _to,
    address _referrer,
    uint256 _pricePaid,
    bytes memory _data
  ) internal
  {
    address implementer = erc1820.getInterfaceImplementer(beneficiary, keySoldInterfaceId);
    if(implementer != address(0))
    {
      IUnlockEventHooks(implementer).keySold(msg.sender, _to, _referrer, _pricePaid, _data);
    }
  }
}