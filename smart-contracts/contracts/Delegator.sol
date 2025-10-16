/* solhint-disable no-inline-assembly */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable5/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/token/ERC20/ERC20Upgradeable.sol";
import "hardhat/console.sol";

contract Delegate {
  constructor(address token, address to) {
    ERC20VotesUpgradeable(token).delegate(to); // Delegates to the specified address
    IERC20(token).approve(msg.sender, type(uint).max); // Approve the caller to get all the tokens
  }
}

contract Delegator {
  address public immutable TOKEN;
  mapping(address => mapping(address => Delegate)) public delegations;

  constructor(address token) {
    TOKEN = token;
  }

  function delegate(address to, uint amount) external {
    if (address(delegations[msg.sender][to]) == address(0)) {
      // Deploy a new contract
      Delegate d = new Delegate(TOKEN, to);
      delegations[msg.sender][to] = d;
    }
    IERC20(TOKEN).transferFrom(
      msg.sender,
      address(delegations[msg.sender][to]),
      amount
    );
  }

  function undelegate(address from) external {
    address delegationContract = address(delegations[msg.sender][from]);
    IERC20(TOKEN).transferFrom(
      delegationContract,
      msg.sender,
      IERC20(TOKEN).balanceOf(delegationContract)
    );
  }
}
