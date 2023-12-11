// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

interface ISwapBurner {
  function swapAndBurn(
    address tokenAddress,
    uint24 poolFee
  ) external payable returns (uint amount);
}
