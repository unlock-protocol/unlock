// SPDX-License-Identifier: MIT
pragma solidity >=0.5.17 <0.9.0;

/**
 * @notice Functions to be implemented by a keyCancelHook.
 * @dev Lock hooks are configured by calling `setEventHooks` on the lock.
 */
interface ILockHasRoleHook {
  /**
   * @notice Check if a role is attributed to a specific address
   * @param role keccak of the role
   * @param account the address to check the role for
   * @param nativeRole existing tole inthe hook
   */
  function hasRole(
    bytes32 role,
    address account,
    bool nativeRole
  ) external view returns (bool);
}
