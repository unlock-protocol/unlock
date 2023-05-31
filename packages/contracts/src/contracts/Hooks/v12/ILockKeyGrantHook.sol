// SPDX-License-Identifier: MIT
pragma solidity >=0.5.17 <0.9.0;

/**
 * @notice Functions to be implemented by a KeyGrantedHook.
 * @dev Lock hooks are configured by calling `setEventHooks` on the lock.
 */
interface ILockKeyGrantHook {
  /**
   * @notice If the lock owner has registered an implementer then this hook
   * is called with every key granted.
   * @param tokenId the id of the granted key
   * @param from the msg.sender granting the key
   * @param recipient the account which will be granted a key
   * @param keyManager an additional keyManager for the key
   * @param expiration the expiration timestamp of the key
   * @dev the lock's address is the `msg.sender` when this function is called
   */
  function onKeyGranted(
    uint tokenId,
    address from,
    address recipient,
    address keyManager,
    uint expiration
  ) external;
}
