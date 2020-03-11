pragma solidity 0.5.16;

import '../interfaces/ILockEventHooks.sol';
import './MixinLockCore.sol';

/**
 * @title Implements callback hooks for Locks.
 * @author Nick Mancuso (unlock-protocol.com)
 */
contract MixinEventHooks is
  MixinLockCore
{
  ILockEventHooks public onKeySoldHook;
  ILockEventHooks public onKeyCancelHook;

  /**
   * @notice Allows a lock manager to add or remove an event hook
   */
  function setEventHooks(
    address _onKeySoldHook,
    address _onKeyCancelHook
  ) external
    onlyLockManager()
  {
    onKeySoldHook = ILockEventHooks(_onKeySoldHook);
    onKeyCancelHook = ILockEventHooks(_onKeyCancelHook);
  }

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
    if(address(onKeySoldHook) != address(0))
    {
      onKeySoldHook.keySold(msg.sender, _to, _referrer, _pricePaid, _data);
    }
  }

  /**
   * @dev called anytime a key is canceled in order to inform the hook if there is one registered.
   */
  function _onKeyCancel(
    address _to,
    uint256 _refund
  ) internal
  {
    if(address(onKeyCancelHook) != address(0))
    {
      onKeyCancelHook.keyCancel(msg.sender, _to, _refund);
    }
  }
}
