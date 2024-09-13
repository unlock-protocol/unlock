// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestERC20 is ERC20 {
  constructor() ERC20("BasicToken", "BASIC") {}

  function mint(address holder, uint amount) public returns (uint256) {
    _mint(holder, amount);
  }
}

contract TestERC20WithResultControl is TestERC20 {
  bool reuslt;

  function setResult(bool _result) public {
    reuslt = _result;
  }

  function transfer(
    address recipient,
    uint256 amount
  ) public override returns (bool) {
    return reuslt;
  }

  function transferFrom(
    address sender,
    address recipient,
    uint256 amount
  ) public override returns (bool) {
    return reuslt;
  }
}
