// SPDX-License-Identifier: MIT
pragma solidity >=0.5.17 <0.9.0;

/**
 * @notice Functions to be implemented by a tokenURIHook.
 * @dev Lock hooks are configured by calling `setEventHooks` on the lock.
 */
interface ILockTokenURIHook
{
  /**
   * @notice If the lock owner has registered an implementer
   * then this hook is called with every key cancel.
   * @param lockAddress the address of the lock
   * @param operator the msg.sender issuing the call
   * @param keyId the id (tokenId) of the key (if applicable)
   * @param expirationTimestamp the key expiration timestamp
   */
  function tokenURI(
    address lockAddress,
    address operator,
    uint256 keyId,
    uint expirationTimestamp
  ) external view returns(string memory);
}