// SPDX-License-Identifier: MIT
pragma solidity >=0.5.17 <0.9.0;


/**
 * @notice Functions to be implemented by a keyExtendHook.
 * @dev Lock hooks are configured by calling `setEventHooks` on the lock.
 */
interface ILockKeyExtendHook
{
  /**
   * @notice This hook every time a key is extended.
   * @param tokenId tje id of the key
   * @param from the msg.sender making the purchase
   * @param newTimestamp the account which referred this key sale
   */
  function onKeyExtend(
    uint tokenId,
    address from,
    uint newTimestamp
  ) external;
}
