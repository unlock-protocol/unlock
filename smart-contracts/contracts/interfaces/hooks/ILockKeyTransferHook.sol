// SPDX-License-Identifier: MIT
pragma solidity >=0.5.17 <0.9.0;


/**
 * @notice Functions to be implemented by a onKeyPurchaseHook Hook.
 * @dev Lock hooks are configured by calling `setEventHooks` on the lock.
 */
interface ILockKeyTransferHook
{

  /**
   * @notice If the lock owner has registered an implementer then this hook
   * is called every time balanceOf is called
   * @param lockAddress the address of the current lock
   * @param tokenId the Id of the transferred key 
   * @param operator who initiated the transfer
   * @param from the previous owner of transferred key 
   * @param from the previous owner of transferred key 
   * @param to the new owner of the key
   * @param expirationTimestamp the key expiration timestamp (after transfer)
   */
  function onKeyTransfer(
    address lockAddress,
    uint tokenId,
    address operator,
    address from,
    address to,
    uint expirationTimestamp
  ) external;
}
