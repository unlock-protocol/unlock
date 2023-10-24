import erc20Abi from './ABIs/erc20.json'

async function getBalance(account: string, tokenAddress: string) {
  const { ethers } = require('hardhat')
  const { AddressZero } = ethers.constants

  let balance
  // ETH balance
  if (!tokenAddress || tokenAddress === AddressZero) {
    balance = await ethers.provider.getBalance(account)
  } else {
    // erc20 balance
    const token = await ethers.getContractAt(erc20Abi, tokenAddress)
    balance = await token.balanceOf(account)
  }
  return balance
}
export default { getBalance }
