// SPDX-License-Identifier: MIT
// ABOUTME: Allows a token holder to delegate voting power to multiple addresses simultaneously.
pragma solidity ^0.8.21;

import {IERC20} from "@openzeppelin/contracts-upgradeable5/token/ERC20/ERC20Upgradeable.sol";
import {Delegate} from "./Delegate.sol";

contract Delegator {
  address public immutable TOKEN;
  mapping(address => mapping(address => Delegate)) public delegations;

  constructor(address token) {
    TOKEN = token;
  }

  function delegate(address to, uint256 amount) external {
    if (address(delegations[msg.sender][to]) == address(0)) {
      // Deploy a new contract to hold tokens and delegate votes
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
