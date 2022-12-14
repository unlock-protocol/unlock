// SPDX-License-Identifier: MIT
pragma solidity >=0.5.17 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IWETH is IERC20 {
    function deposit() external payable;
    function withdraw(uint) external;
}