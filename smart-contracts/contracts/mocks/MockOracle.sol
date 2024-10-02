// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "../interfaces/IUniswapOracleV3.sol";

contract MockOracle {
  uint FEE;
  uint PERIOD = 3600;

  // store rates
  struct Rate {
    address tokenIn;
    uint rate;
    address tokenOut;
  }
  mapping(address => mapping(address => uint)) rates;
  error MissingTokenPair(address tokenIn, address tokenOut);

  // store an array of rates expressed as struct
  constructor(uint _fee, Rate[] memory _rates) {
    FEE = _fee;
    for (uint i = 0; i < _rates.length; i++) {
      _addRate(_rates[i]);
    }
  }

  function _addRate(Rate memory _rate) internal {
    rates[_rate.tokenIn][_rate.tokenOut] = _rate.rate;
  }

  function _consult(
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) internal view returns (uint256 _amountOut) {
    uint rate = rates[_tokenIn][_tokenOut];
    if (rate == 0) {
      revert MissingTokenPair(_tokenIn, _tokenOut);
    }
    return rate * _amountIn;
  }

  function addRate(Rate memory _rate) public {
    _addRate(_rate);
  }

  function consult(
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) external view returns (uint256 _amountOut) {
    return _consult(_tokenIn, _amountIn, _tokenOut);
  }

  function updateAndConsult(
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) external view returns (uint256 _amountOut) {
    return _consult(_tokenIn, _amountIn, _tokenOut);
  }
}
