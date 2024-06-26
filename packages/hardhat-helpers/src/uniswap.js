const { ethers } = require('ethers')

const { AllowanceTransfer } = require('@uniswap/permit2-sdk')
const { Token } = require('@uniswap/sdk-core')

const { getTokens } = require('./tokens')
const { getNetwork, getUdt } = require('./unlock')

const { nativeOnChain } = require('@uniswap/smart-order-router')

const ERC20_ABI = require('./ABIs/erc20.json')

// from '@uniswap/universal-router-sdk'
const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3'

const getUniswapTokens = async (chainId = 1) => {
  const { DAI, WETH, USDC, WBTC } = await getTokens()
  const udt = await getUdt()

  return {
    native: nativeOnChain(chainId),
    dai: new Token(chainId, DAI, 18, 'DAI'),
    weth: new Token(chainId, WETH, 18, 'WETH'),
    usdc: new Token(chainId, USDC, 6, 'USDC'),
    udt: new Token(chainId, udt.address, 18, 'UDT'),
    wBtc: new Token(chainId, WBTC, 18, 'wBTC'),
  }
}

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
  getUniswapTokens,
  PERMIT2_ADDRESS,
}
