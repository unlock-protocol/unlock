// SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './utils/CallContract.sol';
import './TokenSpender.sol';

/**
 * @notice call any contract(s) and then refund the remaining balance (if any)
 * You can include ETH with the call but in order to pay with an ERC-20 token
 * first `approve` the `tokenSpender`.
 *
 * NEVER `approve` this contract directly - someone could steal your funds if you do.
 *
 * Idea from 1inch.exchange
 * https://etherscan.io/address/0x11111254369792b2Ca5d084aB5eEA397cA8fa48B#code
 */
contract SwapAndCall is Pausable, Ownable
{
  using Address for address payable;
  using CallContract for address;
  using SafeERC20 for IERC20;

  /**
   * @notice this contract is used to transfer ERC-20 tokens from the msg.sender
   * to be used in one or more of the arbitrary calls made in the swapAndCall.
   * @dev call `appove` on the ERC-20 token with this address as the spender.
   * It is safe to approve with amount set to MAX_UINT for unlimited use
   * (e.g. calling swapAndCall again in the future without requiring another `approve` tx).
   */
  TokenSpender public tokenSpender;

  constructor()
  {
    tokenSpender = new TokenSpender();
  }

  /**
   * @notice accept ETH from other contracts.
   * @dev this is required for some calls such as a Uniswap from tokens to ETH.
   */
  receive() external payable
  {
    // solium-disable-next-line security/no-tx-origin
    require(msg.sender != tx.origin, 'ONLY_CALLABLE_BY_CONTRACTS');
  }

  /**
   * @notice a helper function for swapAndCall.
   * @dev makes any number of arbitrary contract calls.
   * If any revert, the entire transaction reverts.
   */
  function _callContracts(
    address[] memory _contracts,
    bytes memory _callDataConcat,
    uint[] memory _startPositions,
    uint[] memory _values
  ) private
  {
    uint count = _contracts.length;
    for (uint i = 0; i < count; i++)
    {
      require(_contracts[i] != address(tokenSpender), 'DO_NOT_CALL_TOKEN_SPENDER');

      // If the value is set to MAX_UINT (an impossible ether amount) use the entire
      // available balance instead.
      uint value = _values[i];
      if(value == type(uint).max)
      {
        value = address(this).balance;
      }

      uint startPosition = 0;
      if(i > 0)
      {
        startPosition = _startPositions[i - 1];
      }
      uint endPosition;
      if(i == count - 1)
      {
        endPosition = _callDataConcat.length;
      }
      else
      {
        endPosition = _startPositions[i];
      }

      _contracts[i]._callByPosition(
        _callDataConcat,
        startPosition,
        endPosition - startPosition,
        value
      );
    }
  }

  /**
   * @notice Make a series of calls and then refunds any funds remaining.
   * @param _sourceToken Optional. An ERC-20 token to collect funds from to be used by the arbirary calls.
   * @param _sourceAmount The number of tokens to collect or 0 if n/a.
   * @param _contracts The contract address for each call to make.
   * @param _callDataConcat Call data for each call, appended into a single bytes field.
   * @param _startPositions The start position of each call callData in _callDataConcat,
   * skipping the first (assumed to be 0).
   * @param _values The call value to include with each call.  Use MAX_UINT to include the contract's
   * entire balance at the time of the call.
   * @param _tokenToRefund Optional. An ERC-20 token to refund if any balance remains.
   * ETH and _sourceToken are always refunded.
   */
  function swapAndCall(
    IERC20 _sourceToken,
    uint _sourceAmount,
    address[] calldata _contracts,
    bytes calldata _callDataConcat,
    uint[] calldata _startPositions,
    uint[] calldata _values,
    IERC20 _tokenToRefund
  ) external payable
    whenNotPaused()
  {
    // Collect ERC-20 tokens to use with the calls below (if applicable)
    if(_sourceAmount > 0)
    {
      tokenSpender.claimTokens(_sourceToken, msg.sender, _sourceAmount);
    }

    // Make any number of arbitrary contract calls
    _callContracts(_contracts, _callDataConcat, _startPositions, _values);

    // Refund ETH
    uint amount = address(this).balance;
    if(amount > 0)
    {
      payable(msg.sender).sendValue(amount);
    }

    // Refund tokens
    if(address(_sourceToken) != address(0))
    {
      amount = _sourceToken.balanceOf(address(this));
      if(amount > 0)
      {
        _sourceToken.safeTransfer(payable(msg.sender), amount);
      }
    }
    if(address(_tokenToRefund) != address(0))
    {
      amount = _tokenToRefund.balanceOf(address(this));
      if(amount > 0)
      {
        _tokenToRefund.safeTransfer(payable(msg.sender), amount);
      }
    }
  }

  /**
  * @dev Triggers stopped state.
  */
  function pause() public onlyOwner
  {
    _pause();
  }

  /**
  * @dev Returns to normal state.
  */
  function unpause() public onlyOwner
  {
    _unpause();
  }
}
