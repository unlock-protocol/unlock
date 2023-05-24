// SPDX-License-Identifier: MIT
pragma solidity >=0.5.17 <0.9.0;

/**
 * @notice Functions to be implemented by a hasValidKey Hook.
 * @dev Lock hooks are configured by calling `setEventHooks` on the lock.
 */
interface ILockValidKeyHook {
  /**
   * @notice If the lock owner has registered an implementer then this hook
   * is called every time `isValidKey` is called (which affects `getHasValidKey` and `balanceOf`)
   * @param lockAddress the address of the current lock
   * @param operator the address that is calling the function (`msg.sender`)
   * @param tokenId the id of the token to check
   * @param expirationTimestamp the key expiration timestamp
   * @param keyOwner the owner of the key
   * @param isValidKey the actual validity of the key
   */
  function isValidKey(
    address lockAddress,
    address operator,
    uint tokenId,
    uint expirationTimestamp,
    address keyOwner,
    bool isValidKey
  ) external view returns (bool);
}
