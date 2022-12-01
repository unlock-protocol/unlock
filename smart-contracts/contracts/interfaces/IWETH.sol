// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 < 0.9.0;
interface IWETH {
    function deposit() external payable;
    function transfer(address to, uint value) external returns (bool);
    function withdraw(uint) external;
    function balanceOf(address) external returns(uint);
}