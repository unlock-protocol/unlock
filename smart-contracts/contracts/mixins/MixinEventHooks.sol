pragma solidity 0.5.10;

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
  bytes32 public constant keySoldInterfaceId = 0x4d99da10ff5120f726d35edd8dbd417bbe55d90453b8432acd284e650ee2c6f0;

  // `keccak256("IUnlockEventHooks_keyCancel")`
  bytes32 public constant keyCancelInterfaceId = 0xd6342b4bfdf66164985c9f5fe235f643a035ee12f507d7bd0f8c89e07e790f68;

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

  /**
   * @dev called anytime a key is sold in order to inform the hook if there is one registered.
   */
  function _onKeyCancel(
    address _to,
    uint256 _refund
  ) internal
  {
    address implementer = erc1820.getInterfaceImplementer(beneficiary, keyCancelInterfaceId);
    if(implementer != address(0))
    {
      IUnlockEventHooks(implementer).keyCancel(msg.sender, _to, _refund);
    }
  }
}