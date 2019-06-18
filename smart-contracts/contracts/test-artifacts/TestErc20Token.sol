pragma solidity 0.5.9;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol';


/**
 * This is an implementation of an ERC20 token to be used in tests.
 * It's a standard ERC20 implementation + `mint` (for testing).
 *
 * This contract should not be used in production.
 */
contract TestErc20Token is
  ERC20Mintable,
  ERC20Detailed
{
  constructor() public
    ERC20Detailed('Test Token', 'TT', 18)
  {}
}