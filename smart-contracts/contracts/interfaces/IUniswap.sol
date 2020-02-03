pragma solidity 0.5.16;

/// @title Functions from the uniswap contract interface

interface IUniswap {
  function getTokenToEthInputPrice(uint tokens_sold) external returns (uint256);
}
