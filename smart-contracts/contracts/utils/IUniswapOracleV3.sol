// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

interface IUniswapOracleV3 {

    function PERIOD() external returns (uint256);

    function factory() external returns (address);

    function update(address _tokenIn, address _tokenOut) external;

    function consult(
        address _tokenIn,
        uint256 _amountIn,
        address _tokenOut
    ) external view returns (uint256 _amountOut);

    function updateAndConsult(
        address _tokenIn,
        uint256 _amountIn,
        address _tokenOut
    ) external returns (uint256 _amountOut);

}