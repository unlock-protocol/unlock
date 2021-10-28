pragma solidity >=0.5.0;


/**
 * @notice Functions to be implemented by a keyCancelHook.
 * @dev Lock hooks are configured by calling `setEventHooks` on the lock.
 */
interface ILockKeyCancelHookV7
{
  /**
   * @notice If the lock owner has registered an implementer
   * then this hook is called with every key cancel.
   * @param operator the msg.sender issuing the cancel
   * @param to the account which had the key canceled
   * @param refund the amount sent to the `to` account (ETH or a ERC-20 token)
   */
  function onKeyCancel(
    address operator,
    address to,
    uint256 refund
  ) external;
}