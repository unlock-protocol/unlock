// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

import "../interfaces/IUniswapOracleV3.sol";
import "@uniswap/v3-periphery/contracts/libraries/OracleLibrary.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";

contract UniswapOracleV3 is IUniswapOracleV3 {
  uint256 public constant override PERIOD = 60 * 60; // in seconds
  address public immutable override factory;
  uint24 public immutable fee;

  event PairAdded(address token1, address token2);

  constructor(address _factory, uint24 _fee) {
    factory = _factory;
    fee = _fee;
  }

  function consult(
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) public view override returns (uint256 quoteAmount) {
    address pool = IUniswapV3Factory(factory).getPool(_tokenIn, _tokenOut, fee);
    if (pool == address(0)) {
      return 0;
    }
    (int24 timeWeightedAverageTick, ) = OracleLibrary.consult(
      pool,
      uint32(PERIOD)
    );
    quoteAmount = OracleLibrary.getQuoteAtTick(
      timeWeightedAverageTick,
      uint128(_amountIn),
      _tokenIn,
      _tokenOut
    );
  }

  // deprec
  function update(address _tokenIn, address _tokenOut) public override {}

  // deprec
  function updateAndConsult(
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) external view override returns (uint256 _amountOut) {
    _amountOut = consult(_tokenIn, _amountIn, _tokenOut);
  }
}
