// SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';


/**
 * @notice Users should ERC-20 approve this contract to spend their tokens in order
 * to allow the supportedContract to move funds.
 * @dev This layer adds security, allowing the supportedContract to make arbitrary contract
 * calls without risking someone abusing a previous ERC-20 approval.
 *
 * Idea from 1inch.exchange
 * https://etherscan.io/address/0x11111254369792b2Ca5d084aB5eEA397cA8fa48B#code
 */
contract TokenSpender
{
  using SafeERC20 for IERC20;

  /**
   * @notice The contract which may move tokens on a user's behalf.
   * Do not approve spending unless you also trust the supportedContract implementation.
   */
  address public supportedContract;

  constructor()
  {
    supportedContract = msg.sender;
  }

  /**
   * @notice Calls `transferFrom` to move tokens from the given user into the supportedContract.
   * @dev To remain secure the `_from` account provided must be the original msg.sender or msg.origin.
   */
  function claimTokens(
    IERC20 _token,
    address _from,
    uint256 _amount
  ) external
  {
    require(msg.sender == supportedContract, 'ACCESS_RESTRICTED');
    _token.safeTransferFrom(_from, supportedContract, _amount);
  }
}