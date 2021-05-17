pragma solidity 0.5.17;

interface IMintableERC20
{
  function mint(address account, uint256 amount) external returns (bool);
  function totalSupply() external returns (uint);
}