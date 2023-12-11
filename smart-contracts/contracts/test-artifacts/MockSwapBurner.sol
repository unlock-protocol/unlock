import {ISwapBurner} from "../interfaces/ISwapBurner.sol";
import "../interfaces/IMintableERC20.sol";
import "hardhat/console.sol";

contract MockSwapBurner is ISwapBurner {
  // addresses on current chain
  address public unlockAddress;

  // required by Uniswap Universal Router
  address public permit2;
  address public uniswapRouter;

  constructor(
    address _unlockAddress,
    address _permit2Address,
    address _uniswapRouter
  ) {
    unlockAddress = _unlockAddress;
    permit2 = _permit2Address;
    uniswapRouter = _uniswapRouter;
  }

  function getBalance(address token) internal view returns (uint) {
    return
      token == address(0)
        ? address(this).balance
        : IMintableERC20(token).balanceOf(address(this));
  }

  function swapAndBurn(
    address tokenAddress,
    uint24 poolFee
  ) public payable returns (uint amount) {
    // console.log(tokenAddress);
  }

  // required to receive ETH
  receive() external payable {}
}
