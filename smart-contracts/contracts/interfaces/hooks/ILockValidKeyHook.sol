// SPDX-License-Identifier: MIT
pragma solidity >=0.5.17 <0.9.0;


/**
 * @notice Functions to be implemented by a hasValidKey Hook.
 * @dev Lock hooks are configured by calling `setEventHooks` on the lock.
 */
interface ILockValidKeyHook
{

  /**
   * @notice If the lock owner has registered an implementer then this hook
   * is called every time balanceOf is called
   * @param lockAddress the address of the current lock
   * @param keyOwner the potential owner of the key for which we are retrieving the `balanceof`
   * @param expirationTimestamp the key expiration timestamp
   */
  function hasValidKey(
    address lockAddress,
    address keyOwner,
    uint256 expirationTimestamp,
    bool isValidKey
  ) 
  external view
  returns (bool);
}
