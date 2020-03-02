pragma solidity 0.5.16;


interface ILockEventHooks {
  /**
   * @notice If the lock owner has registered an implementer
   * then this hook is called with every key sold.
   * @param from the msg.sender making the purchase
   * @param to the account which will be granted a key
   * @param referrer the account which referred this key sale
   * @param pricePaid the amount paid for the key, in the lock's currency (ETH or a ERC-20 token)
   * @param data arbitrary data populated by the front-end which initiated the sale
   */
  function keySold(
    address from,
    address to,
    address referrer,
    uint256 pricePaid,
    bytes calldata data
  ) external;

  /**
   * @notice If the lock owner has registered an implementer
   * then this hook is called with every key cancel.
   * @param operator the msg.sender issuing the cancel
   * @param to the account which had the key canceled
   * @param refund the amount sent to the `to` account (ETH or a ERC-20 token)
   */
  function keyCancel(
    address operator,
    address to,
    uint256 refund
  ) external;
}