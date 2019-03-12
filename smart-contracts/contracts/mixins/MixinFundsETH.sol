pragma solidity 0.5.5;

import './interfaces/IMixinFunds.sol';

/**
 * @title An interface to be leveraged by other mixins, allowing them to interact
 * with funds without knowing the details about how it is implemented 
 * (e.g. ETH or ERC20 tokens).
 * @author HardlyDifficult (unlock-protocol.com)
 */
contract MixinFundsETH is
  IMixinFunds
{
  /**
   * Ensures that the msg.sender has paid at least the price stated.
   *
   * With ETH, this means the function originally called was `payable` and the
   * transaction included at least the amount requested.
   */
  function _chargeAtLeast(
    uint _price
  ) internal
  {
    require(msg.value >= _price, 'NOT_ENOUGH_FUNDS');
  }

  /**
   * Transfers funds from the contract to the account provided.
   */
  function _transfer(
    address _to,
    uint _amount
  ) internal
  {
    address(uint160(_to)).transfer(_amount);
  }

  /**
   * Gets the current ETH balance of the account provided.
   */
  function _getBalance(
    address _account
  ) internal view
    returns (uint)
  {
    return _account.balance;
  }
}