pragma solidity 0.5.12;


/**
 * This is an implementation of the ERC20 interface but without any data
 * backing the token to be used in tests.
 *
 * This contract should not be used in production.
 */
contract TestErc20Noop
{
  function transfer(
    address to,
    uint value
  ) external
    returns (bool)
  {
    return true;
  }

  function approve(
    address spender,
    uint value
  ) external
    returns (bool)
  {
    return true;
  }

  function mint(
    address to,
    uint value
  ) public
    returns (bool)
  {
    return true;
  }

  function transferFrom(
    address from,
    address to,
    uint value
  ) external
    returns (bool)
  {
    return true;
  }

  function balanceOf(
    address who
  ) external view
    returns (uint)
  {
    return uint(-1);
  }
}
