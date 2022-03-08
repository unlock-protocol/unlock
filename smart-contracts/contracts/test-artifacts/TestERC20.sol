// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestERC20 is ERC20 {
    constructor() ERC20("BasicToken", "BASIC") {}

    function mint(
        address holder, 
        uint amount
    )
    public
    returns (uint256)
    {
        _mint(holder, amount);
    }
}