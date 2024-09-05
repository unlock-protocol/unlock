import { ADDRESS_ZERO } from './constants'
import erc20Abi from './ABIs/erc20.json'
import { getTokenInfo } from './uniswap'
async function getBalance(account: string, tokenAddress: string) {
  const { ethers } = require('hardhat')
  let balance
  // ETH balance
  if (!tokenAddress || tokenAddress === ADDRESS_ZERO) {
    balance = await ethers.provider.getBalance(account)
  } else {
    // erc20 balance
    const token = await ethers.getContractAt(erc20Abi, tokenAddress)
    balance = await token.balanceOf(account)
  }
  return balance
}

async function logBalance(tokenAddress: string, account: string) {
  const balance = await getBalance(account, tokenAddress)
  const { symbol } = await getTokenInfo(tokenAddress)
  console.log(` balance ${symbol}: `, balance.toString())
}

export default { getBalance, logBalance }
