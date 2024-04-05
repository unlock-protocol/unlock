// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.17;

import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

interface IUniversalRouter is IERC721Receiver, IERC1155Receiver {
  /// @notice Thrown when a required command has failed
  error ExecutionFailed(uint256 commandIndex, bytes message);

  /// @notice Thrown when attempting to send ETH directly to the contract
  error ETHNotAccepted();

  /// @notice Thrown when executing commands with an expired deadline
  error TransactionDeadlinePassed();

  /// @notice Thrown when attempting to execute commands and an incorrect number of inputs are provided
  error LengthMismatch();

  /// @notice Executes encoded commands along with provided inputs.
  /// @param commands A set of concatenated commands, each 1 byte in length
  /// @param inputs An array of byte strings containing abi encoded inputs for each command
  function execute(
    bytes calldata commands,
    bytes[] calldata inputs
  ) external payable;

  /// @notice Executes encoded commands along with provided inputs. Reverts if deadline has expired.
  /// @param commands A set of concatenated commands, each 1 byte in length
  /// @param inputs An array of byte strings containing abi encoded inputs for each command
  /// @param deadline The deadline by which the transaction must be executed
  function execute(
    bytes calldata commands,
    bytes[] calldata inputs,
    uint256 deadline
  ) external payable;
}
