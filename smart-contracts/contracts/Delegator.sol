/* solhint-disable no-inline-assembly */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable5/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/token/ERC20/ERC20Upgradeable.sol";

contract Delegate {
  constructor(address token, address to) {
    ERC20VotesUpgradeable(token).delegate(to); // Delegate tokens
    IERC20(token).approve(msg.sender, type(uint).max); // Approve the caller to spend all tokens
  }
}

contract Delegator {
  struct Delegation {
    address delegationContract;
    address funder;
  }

  address public immutable TOKEN;
  mapping(address => Delegation) delegations;

  constructor(address token) {
    TOKEN = token;
  }

  function delegate(address to, uint amount) external {
    Delegate d = new Delegate(TOKEN, to);
    delegations[to] = Delegation(address(d), msg.sender);
    IERC20(TOKEN).transferFrom(msg.sender, address(d), amount);
  }

  function undelegate(address from) external {
    Delegation memory delegation = delegations[from];
    IERC20(TOKEN).transferFrom(
      delegation.delegationContract,
      delegation.funder,
      IERC20(TOKEN).balanceOf(delegation.delegationContract)
    );
  }
}
