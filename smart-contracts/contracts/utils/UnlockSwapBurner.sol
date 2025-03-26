// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IUniversalRouter.sol";
import "../interfaces/IMintableERC20.sol";
import "../interfaces/IUnlock.sol";
import "../interfaces/IWETH.sol";
import "../interfaces/IUniswapOracleV3.sol";

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
  address public immutable UNLOCK_ADDRESS;
  address public immutable UNISWAP_UNIVERSAL_ROUTER;

  // dead address to burn
  address public immutable BURN_ADDRESS =
    0x000000000000000000000000000000000000dEaD;

  // specified in https://docs.uniswap.org/contracts/universal-router/technical-reference#v3_swap_exact_in
  uint256 immutable V3_SWAP_EXACT_IN = 0x00;

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
   * @param _uniswapUniversalRouter the address of Uniswap Universal Router contract
   */
  constructor(address _unlockAddress, address _uniswapUniversalRouter) {
    UNLOCK_ADDRESS = _unlockAddress;
    UNISWAP_UNIVERSAL_ROUTER = _uniswapUniversalRouter;
  }

  /**
   * Simple helper to retrieve balance in ERC20 or native tokens
   * @param token the address of the token (address(0) for native token)
   */
  function _getBalance(address token) internal view returns (uint) {
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
    address udtAddress = IUnlock(UNLOCK_ADDRESS).governanceToken();
    address wrappedAddress = IUnlock(UNLOCK_ADDRESS).weth();

    // get total balance of token to swap
    uint tokenAmount = _getBalance(tokenAddress);
    uint udtBefore = _getBalance(udtAddress);

    if (tokenAddress == udtAddress) {
      revert UnauthorizedSwap();
    }

    // get the quote from the oracle
    address oracleAddress = IUnlock(UNLOCK_ADDRESS).uniswapOracles(
      tokenAddress
    );
    uint256 quoteAmount = IUniswapOracleV3(oracleAddress).consult(
      address(tokenAddress),
      uint256(tokenAmount),
      address(udtAddress)
    );

    // Apply 2% slippage tolerance
    uint amountOutMinimum = (quoteAmount * 98) / 100;

    // wrap native tokens
    if (tokenAddress == address(0)) {
      IWETH(wrappedAddress).deposit{value: tokenAmount}();
      tokenAddress = wrappedAddress;
      tokenAmount = _getBalance(tokenAddress);
    }

    // transfer the tokens to the router
    IERC20(tokenAddress).transfer(UNISWAP_UNIVERSAL_ROUTER, tokenAmount);

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
      amountOutMinimum, // amountOutMinimum
      tokenAddress == wrappedAddress
        ? defaultPath
        : abi.encodePacked(tokenAddress, poolFee, defaultPath), // path
      false // funds are not coming from PERMIT2
    );

    // Executes the swap.
    IUniversalRouter(UNISWAP_UNIVERSAL_ROUTER).execute(
      commands,
      inputs,
      block.timestamp + 60 // expires after 1min
    );

    // calculate how much UDT has been received
    uint amountUDTOut = _getBalance(udtAddress) - udtBefore;
    if (amountUDTOut == 0) {
      revert UDTSwapFailed(UNISWAP_UNIVERSAL_ROUTER, tokenAddress, tokenAmount);
    }

    // burn the newly received UDT
    bool success = IERC20(udtAddress).transfer(BURN_ADDRESS, amountUDTOut);
    if (success == false) {
      revert UDTSwapFailed(UNISWAP_UNIVERSAL_ROUTER, tokenAddress, tokenAmount);
    } else {
      emit SwapBurn(tokenAddress, tokenAmount, amountUDTOut);
    }

    return amountUDTOut;
  }

  // required to withdraw WETH
  receive() external payable {}
}
