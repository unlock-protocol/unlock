const { ethers } = require('ethers')
const { getTokens } = require('./tokens')
const { getNetwork, getUdt } = require('./unlock')

const ERC20_ABI = require('./ABIs/erc20.json')

// from '@uniswap/universal-router-sdk'
const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3'

export const getTokenInfo = async (tokenAddress) => {
  const { ethers } = require('hardhat')
  const token0 = await ethers.getContractAt(ERC20_ABI, tokenAddress)
  const [decimals, symbol] = await Promise.all([
    await token0.decimals(),
    await token0.symbol(),
  ])
  return {
    decimals,
    symbol,
  }
}

export default {
  getTokenInfo,
  PERMIT2_ADDRESS,
}
