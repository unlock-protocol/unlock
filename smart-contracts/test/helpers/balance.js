const { ethers } = require('hardhat')
const { ADDRESS_ZERO } = require('./constants')

async function getBalance(account, tokenAddress) {
  let balance
  // ETH balance
  if (!tokenAddress || tokenAddress === ADDRESS_ZERO) {
    balance = await ethers.provider.getBalance(account)
  } else {
    // erc20 balance
    const token = await ethers.getContractAt(
      '@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20',
      tokenAddress
    )
    balance = await token.balanceOf(account)
  }
  return balance
}

module.exports = {
  getBalance,
}
