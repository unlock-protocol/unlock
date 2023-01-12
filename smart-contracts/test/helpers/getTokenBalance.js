const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')
const { ADDRESS_ZERO } = require('./constants')

const Erc20Token = artifacts.require(
  '@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20'
)

module.exports = async function getTokenBalance(account, tokenAddress) {
  // ETH balance
  if (!tokenAddress || tokenAddress === ADDRESS_ZERO) {
    const balanceETH = await ethers.provider.getBalance(account)
    return new BigNumber(balanceETH.toString())
  }
  // erc20 balance
  const token = await Erc20Token.at(tokenAddress)
  const balance = await token.balanceOf(account)
  return new BigNumber(balance.toString())
}
