// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "../interfaces/IMintableERC20.sol";
import "../interfaces/IPermit2.sol";
import "../interfaces/IUnlock.sol";

library SafeCast160 {
  error UnsafeCast();

  /// @notice Safely casts uint256 to uint160
  /// @param value The uint256 to be cast
  function toUint160(uint256 value) internal pure returns (uint160) {
    if (value > type(uint160).max) revert UnsafeCast();
    return uint160(value);
  }
}

contract UnlockSwapBurner {
  // make sure we dont exceed type uint160 when casting
  using SafeCast160 for uint256;

  // addresses on current chain
  address public udtAddress;

  // required by Uniswap Universal Router
  address public permit2;
  mapping(address => bool) public uniswapRouters;

  // dead address to burn
  address public constant burnAddress =
    0x000000000000000000000000000000000000dEaD;

  address public constant UNI_V2_UDT =
    0x9cA8AEf2372c705d6848fddA3C1267a7F51267C1;
  //
  // set the default pool fee to 0.3%.
  // uint24 public constant poolFee = 3000;

  // events
  event SwapBurn(address tokenAddress, uint amountSpent, uint amountBurnt);

  // errors
  error UDTSwapFailed(
    address uniswapRouter,
    address tokenIn,
    uint amount,
    bytes callData
  );
  error InsufficientBalance();
  error UnautorizedRouter(address routerAddress);
  error UnauthorizedBalanceChange();

  /**
   * Set the address of Uniswap Permit2 helper contract
   * @param _udtAddress the address of UDT contract
   * @param _permit2Address the address of Uniswap PERMIT2 contract
   */
  constructor(
    address _udtAddress,
    address _permit2Address,
    address[] memory _uniswapRouters
  ) {
    udtAddress = _udtAddress;
    permit2 = _permit2Address;
    for (uint i = 0; i < _uniswapRouters.length; i++) {
      uniswapRouters[_uniswapRouters[i]] = true;
    }
  }

  /**
   * Simple helper to retrieve balance in ERC20 or native tokens
   * @param token the address of the token (address(0) for native token)
   */
  function getBalance(address token) internal view returns (uint) {
    return
      token == address(0)
        ? address(this).balance
        : IMintableERC20(token).balanceOf(address(this));
  }

  // NB: unused for now
  function _encodeSwapPath(
    address[] memory _path,
    uint24[] memory _fees
  ) internal pure returns (bytes memory path) {
    path = abi.encodePacked(_path[0]);
    for (uint i = 0; i < _fees.length; i++) {
      path = abi.encodePacked(path, _fees[i], _path[i + 1]);
    }
    path = abi.encodePacked(path, UNI_V2_UDT);
  }

  /**
   * Swap tokens to UDT and burn the tokens
   */
  function swapAndBurn(
    address tokenAddress,
    address swapRouter,
    uint amount,
    bytes memory path
  ) public payable returns (bytes memory) {
    // make sure given uniswapRouter is whitelisted
    if (uniswapRouters[swapRouter] != true) {
      revert UnautorizedRouter(swapRouter);
    }

    // get balances before swap
    uint balanceTokenBefore = getBalance(tokenAddress);
    uint balanceUdtBefore = getBalance(udtAddress);

    if (tokenAddress != address(0)) {
      // Approve the router to spend src ERC20
      TransferHelper.safeApprove(tokenAddress, swapRouter, amount);

      // approve PERMIT2 to manipulate the token
      IERC20(tokenAddress).approve(permit2, amount);
    }

    // issue PERMIT2 Allowance
    IPermit2(permit2).approve(
      tokenAddress,
      swapRouter,
      amount.toUint160(),
      uint48(block.timestamp + 60) // expires after 1min
    );

    // executes the swap
    // bytes memory path = _encodeSwapPath(_path, _fees);

    ISwapRouter.ExactInputParams memory params = ISwapRouter.ExactInputParams({
      path: path,
      recipient: address(this),
      deadline: block.timestamp,
      amountIn: amount,
      amountOutMinimum: 0
    });

    // Executes the swap.
    uint amountOut = ISwapRouter(swapRouter).exactInput(params);

    // if (success == false) {
    //   revert UDTSwapFailed(swapRouter, tokenAddress, amount, swapCalldata);
    // }

    // TODO: check that Unlock did not spend more than it received
    uint balanceUdtAfter = getBalance(udtAddress);
    if (
      getBalance(tokenAddress) - balanceTokenBefore < 0 ||
      balanceUdtAfter - balanceUdtBefore < 0
    ) {
      // balance too low
      revert UnauthorizedBalanceChange();
    }
  }

  // required to withdraw WETH
  receive() external payable {}
}
