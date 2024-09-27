// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IUniversalRouter.sol";
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
  address public uniswapUniversalRouter;

  // dead address to burn
  address public constant burnAddress =
    0x000000000000000000000000000000000000dEaD;

  // specified in https://docs.uniswap.org/contracts/universal-router/technical-reference#v3_swap_exact_in
  uint256 constant V3_SWAP_EXACT_IN = 0x00;

  // events
  event SwapBurn(address tokenAddress, uint amountSpent, uint amountBurnt);

  // errors
  error UDTSwapFailed(
    address uniswapUniversalRouter,
    address tokenIn,
    uint amount
  );
  error UnauthorizedSwap();

  /**
   * Set the address of Uniswap Permit2 helper contract
   * @param _unlockAddress the address of the Unlock factory contract
   * @param _permit2Address the address of Uniswap PERMIT2 contract
   */
  constructor(
    address _unlockAddress,
    address _permit2Address,
    address _uniswapUniversalRouter
  ) {
    unlockAddress = _unlockAddress;
    permit2 = _permit2Address;
    uniswapUniversalRouter = _uniswapUniversalRouter;
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
    address udtAddress = IUnlock(unlockAddress).governanceToken();
    address wrappedAddress = IUnlock(unlockAddress).weth();

    // get total balance of token to swap
    uint tokenAmount = getBalance(tokenAddress);
    uint udtBefore = getBalance(udtAddress);

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
      TransferHelper.safeApprove(
        tokenAddress,
        uniswapUniversalRouter,
        tokenAmount
      );

      // approve PERMIT2 to manipulate the token
      IERC20(tokenAddress).approve(permit2, tokenAmount);
    }

    // issue PERMIT2 Allowance
    IPermit2(permit2).approve(
      tokenAddress,
      uniswapUniversalRouter,
      tokenAmount.toUint160(),
      uint48(block.timestamp + 60) // expires after 1min
    );

    bytes memory defaultPath = abi.encodePacked(
      wrappedAddress,
      uint24(3000), // default UDT pool fee is set to 0.3%
      udtAddress
    );

    // encode parameters for the swap om UniversalRouter
    bytes memory commands = abi.encodePacked(bytes1(uint8(V3_SWAP_EXACT_IN)));
    bytes[] memory inputs = new bytes[](1);
    inputs[0] = abi.encode(
      address(this), // recipient
      tokenAmount, // amountIn
      0, // amountOutMinimum
      tokenAddress == wrappedAddress
        ? defaultPath
        : abi.encodePacked(tokenAddress, poolFee, defaultPath), // path
      true // funds are not coming from PERMIT2
    );

    // Executes the swap.
    IUniversalRouter(uniswapUniversalRouter).execute(
      commands,
      inputs,
      block.timestamp + 60 // expires after 1min
    );

    // calculate how much UDT has been received
    uint amountUDTOut = getBalance(udtAddress) - udtBefore;
    if (amountUDTOut == 0) {
      revert UDTSwapFailed(uniswapUniversalRouter, tokenAddress, tokenAmount);
    }

    // burn the newly received UDT
    bool success = IERC20(udtAddress).transfer(burnAddress, amountUDTOut);
    if (success == false) {
      revert UDTSwapFailed(uniswapUniversalRouter, tokenAddress, tokenAmount);
    } else {
      emit SwapBurn(tokenAddress, tokenAmount, amountUDTOut);
    }

    return amountUDTOut;
  }

  // required to withdraw WETH
  receive() external payable {}
}
