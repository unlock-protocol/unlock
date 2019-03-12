pragma solidity 0.5.5;

import 'openzeppelin-eth/contracts/ownership/Ownable.sol';
import './interfaces/IMixinFunds.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/IERC20.sol';

/**
 * @title An implementation of the IMixinFunds interface specifically for transacting
 * in Erc20 tokens.
 * @author HardlyDifficult (unlock-protocol.com)
 */
contract MixinFundsErc20 is
  Ownable,
  IMixinFunds
{
  IERC20 public token;

  constructor(
    address _tokenAddress
  ) public {
    token = IERC20(_tokenAddress);
    require(token.totalSupply() > 0, 'INVALID_TOKEN');
  }

  /**
   * Ensures that the msg.sender has paid at least the price stated.
   *
   * With Erc20 tokens, this means transfer the _price to current Lock owner's account.
   */
  function _chargeAtLeast(
    uint _price
  ) internal
  {
    _transfer(address(this), _price);
  }

  /**
   * Transfers funds from the contract to the account provided.
   */
  function _transfer(
    address _to,
    uint _amount
  ) internal
  {
    uint originalBalance = token.balanceOf(address(this));

    token.transferFrom(msg.sender, owner(), _amount);

    // Not all tokens implement the return variable correctly, so instead we assert
    // the value transfered as expected.
    require(token.balanceOf(address(this)) - originalBalance == _amount, 'TRANSFER_FAILED');
  }

  /**
   * Gets the current Erc20 token balance of the account provided.
   */
  function _getBalance(
    address _account
  ) internal view
    returns (uint)
  {
    return token.balanceOf(_account);
  }
}