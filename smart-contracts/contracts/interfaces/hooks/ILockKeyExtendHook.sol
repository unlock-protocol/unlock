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
   * @param the tokenId of the key
   * @param from the msg.sender making the purchase
   * @param recipient the account which will be granted a key
   * @param newTimestamp the account which referred this key sale
   * @param data arbitrary data populated by the front-end which initiated the sale
   * @param minKeyPrice the price including any discount granted from calling this
   * hook's `keyPurchasePrice` function
   * @param pricePaid the value/pricePaid included with the purchase transaction
   * @dev the lock's address is the `msg.sender` when this function is called
   */
  function onKeyExtend(
    uint tokenId,
    address from,
    uint newTimestamp,
    uint pricePaid
  ) external;
}
