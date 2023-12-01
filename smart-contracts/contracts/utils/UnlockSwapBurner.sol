// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "../interfaces/IMintableERC20.sol";
import "../interfaces/IPermit2.sol";
import "../interfaces/IUnlock.sol";
import "../interfaces/IWETH.sol";

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

  // required by Uniswap Universal Router
  address public permit2;
  address public uniswapRouter;

  // dead address to burn
  address public constant burnAddress =
    0x000000000000000000000000000000000000dEaD;

  // events
  event SwapBurn(address tokenAddress, uint amountSpent, uint amountBurnt);

  // errors
  error UDTSwapFailed(address uniswapRouter, address tokenIn, uint amount);
  error InsufficientBalance();
  error UnautorizedRouter(address routerAddress);
  error UnauthorizedSwap();

  /**
   * Set the address of Uniswap Permit2 helper contract
   * @param _unlockAddress the address of the Unlock factory contract
   * @param _permit2Address the address of Uniswap PERMIT2 contract
   */
  constructor(
    address _unlockAddress,
    address _permit2Address,
    address _uniswapRouter
  ) {
    unlockAddress = _unlockAddress;
    permit2 = _permit2Address;
    uniswapRouter = _uniswapRouter;
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

  /**
   * Swap tokens to UDT and burn the tokens
   */
  function swapAndBurn(
    address tokenAddress,
    uint24 poolFee
  ) public payable returns (uint amount) {
    // get info from unlock
    address udtAddress = IUnlock(unlockAddress).udt();
    address wrappedAddress = IUnlock(unlockAddress).weth();

    // get balances before swap
    uint tokenAmount = getBalance(tokenAddress);

    if (tokenAddress == udtAddress) {
      revert UnauthorizedSwap();
    }

    // wrap native tokens
    if (tokenAddress == address(0)) {
      IWETH(wrappedAddress).deposit{value: tokenAmount}();
      tokenAddress = wrappedAddress;
      tokenAmount = getBalance(tokenAddress);
    }

    // approve ERC20 spending
    if (tokenAddress != address(0)) {
      // Approve the router to spend src ERC20
      TransferHelper.safeApprove(tokenAddress, uniswapRouter, tokenAmount);

      // approve PERMIT2 to manipulate the token
      IERC20(tokenAddress).approve(permit2, tokenAmount);
    }

    // issue PERMIT2 Allowance
    IPermit2(permit2).approve(
      tokenAddress,
      uniswapRouter,
      tokenAmount.toUint160(),
      uint48(block.timestamp + 60) // expires after 1min
    );

    bytes memory defaultPath = abi.encodePacked(
      wrappedAddress,
      uint24(3000), // default UDT pool fee is set to 0.3%
      udtAddress
    );

    // executes the swap token > WETH > UDT
    ISwapRouter.ExactInputParams memory params = ISwapRouter.ExactInputParams({
      path: tokenAddress == wrappedAddress
        ? defaultPath
        : abi.encodePacked(tokenAddress, poolFee, defaultPath),
      recipient: address(this),
      deadline: block.timestamp,
      amountIn: tokenAmount,
      amountOutMinimum: 0
    });

    // Executes the swap.
    uint amountUDTOut = ISwapRouter(uniswapRouter).exactInput(params);

    // burn the UDT
    bool success = IERC20(udtAddress).transfer(burnAddress, amountUDTOut);
    if (success == false) {
      revert UDTSwapFailed(uniswapRouter, tokenAddress, tokenAmount);
    } else {
      emit SwapBurn(tokenAddress, tokenAmount, amountUDTOut);
    }

    return amountUDTOut;
  }

  // required to withdraw WETH
  receive() external payable {}
}
