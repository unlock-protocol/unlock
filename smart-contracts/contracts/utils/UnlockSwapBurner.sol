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
  address public unlockAddress;
  address public udtAddress;

  // required by Uniswap Universal Router
  address public permit2;
  address public swapRouter;

  // dead address to burn
  address public constant burnAddress =
    0x000000000000000000000000000000000000dEaD;

  // set the default pool fee to 0.3%.
  uint24 public constant poolFee = 3000;

  // events
  event SwapBurn(address tokenAddress, uint amountSpent, uint amountBurnt);

  // errors
  error SwapFailed(
    address uniswapRouter,
    address tokenIn,
    address tokenOut,
    uint amountInMax,
    bytes callData
  );
  error InsufficientBalance();
  error UnautorizedRouter(address routerAddress);
  error UnauthorizedBalanceChange();

  /**
   * Set the address of Uniswap Permit2 helper contract
   * @param _unlockAddress the address of Unlock contract
   * @param _udtAddress the address of UDT contract
   * @param _permit2Address the address of Uniswap PERMIT2 contract
   */
  constructor(
    address _unlockAddress,
    address _udtAddress,
    address _permit2Address,
    address _swapRouter
  ) {
    unlockAddress = _unlockAddress;
    udtAddress = _udtAddress;
    permit2 = _permit2Address;
    swapRouter = _swapRouter;
  }

  /**
   * Swap tokens to UDT and burn the tokens
   */
  function swapAndBurn(
    address tokenAddress,
    uint amount
  ) public payable returns (bytes memory) {
    uint unlockBalance = IMintableERC20(tokenAddress).balanceOf(unlockAddress);
    amount = amount == 0 ? unlockBalance : amount;

    // get balances before swap
    uint balanceTokenBefore = IMintableERC20(tokenAddress).balanceOf(
      address(this)
    );
    uint udtBalanceBefore = IMintableERC20(udtAddress).balanceOf(address(this));

    // Transfer the specified amount of token to this contract.
    TransferHelper.safeTransferFrom(
      tokenAddress,
      msg.sender,
      address(this),
      amount
    );

    // Approve the router to spend src ERC20
    TransferHelper.safeApprove(tokenAddress, swapRouter, amount);

    // approve PERMIT2 to manipulate the token
    IERC20(tokenAddress).approve(permit2, amount);

    // issue PERMIT2 Allowance
    IPermit2(permit2).approve(
      tokenAddress,
      swapRouter,
      amount.toUint160(),
      uint48(block.timestamp + 60) // expires after 1min
    );

    // swap tokens params
    ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
      .ExactInputSingleParams({
        tokenIn: tokenAddress,
        tokenOut: udtAddress,
        fee: poolFee,
        recipient: address(this),
        deadline: block.timestamp,
        amountIn: amount,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
      });

    // execute the swap.
    uint amountOut = ISwapRouter(swapRouter).exactInputSingle(params);
    uint udtBalanceAfter = IMintableERC20(udtAddress).balanceOf(address(this));

    // assert that the contract received UDT properly
    require((udtBalanceBefore - udtBalanceAfter) == amountOut, "w");

    // TODO: make sure to catch Uniswap revert
    // if (success == false) {
    //   revert SwapFailed(
    //     uniswapRouter,
    //     srcToken,
    //     destToken,
    //     amountInMax,
    //     swapCalldata
    //   );
    // }

    // check that contract did not spend more than it received
    if (
      IMintableERC20(tokenAddress).balanceOf(address(this)) -
        balanceTokenBefore <
      0
    ) {
      // balance too low
      revert UnauthorizedBalanceChange();
    }

    // burn the received UDT
    IMintableERC20(udtAddress).transfer(burnAddress, amountOut);
  }

  // required to withdraw WETH
  receive() external payable {}
}
