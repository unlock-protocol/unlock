pragma solidity 0.5.5;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol';


contract TestErc20Token is
  ERC20,
  ERC20Mintable
{}