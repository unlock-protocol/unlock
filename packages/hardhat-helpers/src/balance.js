async function getBalance(account, tokenAddress) {
  const { ethers } = require('hardhat')
  const { AddressZero } = ethers.constants
  let balance
  // ETH balance
  if (!tokenAddress || tokenAddress === AddressZero) {
    balance = await ethers.provider.getBalance(account)
  } else {
    // erc20 balance
    const token = ethers.getContractAt(
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
