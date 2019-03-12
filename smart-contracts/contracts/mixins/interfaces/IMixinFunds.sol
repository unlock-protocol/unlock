pragma solidity 0.5.5;


/**
 * @title An interface to be leveraged by other mixins, allowing them to interact
 * with funds without knowing the details about how it is implemented 
 * (e.g. ETH or ERC20 tokens).
 * @author HardlyDifficult (unlock-protocol.com)
 */
contract IMixinFunds 
{
  /**
   * Ensures that the msg.sender has paid at least the price stated.
   */
  function _chargeAtLeast(
    uint _price
  )
    internal;

  /**
   * Transfers funds from the contract to the account provided.
   */
  function _transfer(
    address _to,
    uint _amount
  )
    internal;

  /**
   * Gets the current balance of the account provided.
   */
  function _getBalance(
    address _account
  )
    internal view
    returns (uint);
}