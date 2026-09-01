// SPDX-License-Identifier: MIT
// ABOUTME: Minimal contract that holds tokens and delegates votes to a specified address.
pragma solidity ^0.8.21;

import {ERC20VotesUpgradeable} from "@openzeppelin/contracts-upgradeable5/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts-upgradeable5/token/ERC20/ERC20Upgradeable.sol";

contract Delegate {
  constructor(address token, address to) {
    ERC20VotesUpgradeable(token).delegate(to); // Delegates votes to the specified address
    IERC20(token).approve(msg.sender, type(uint256).max); // Approve the Delegator to reclaim tokens
  }
}
