const { ethers } = require('ethers')

const { AllowanceTransfer } = require('@uniswap/permit2-sdk')
const {
  Token,
  CurrencyAmount,
  TradeType,
  Percent,
} = require('@uniswap/sdk-core')

const JSBI = require('jsbi')
const { getTokens } = require('./tokens')
const { getNetwork, getUdt } = require('./unlock')

const {
  AlphaRouter,
  SwapType,
  nativeOnChain,
} = require('@uniswap/smart-order-router')

const ERC20_ABI = require('./ABIs/erc20.json')

// from '@uniswap/universal-router-sdk'
const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3'

// convert swap jsbi to ethers BigNumber
const currencyAmountToBigNumber = (amount) => {
  const { decimals } = amount.currency
  const fixed = ethers.FixedNumber.from(amount.toExact())
  const tokenScale = ethers.FixedNumber.from(
    ethers.BigNumber.from(10).pow(decimals)
  )
  return ethers.BigNumber.from(
    // have to remove trailing .0 "manually" :/
    fixed.mulUnsafe(tokenScale).floor().toString().split('.')[0]
  )
}

/**
 * UNISWAP ROUTER
 * */
async function getUniswapRoute({
  tokenIn,
  tokenOut,
  amoutOut = ethers.parseUnits('10', tokenOut.decimals),
  recipient,
  slippageTolerance = new Percent(10, 100),
  deadline = Math.floor(new Date().getTime() / 1000 + 100000),
  permitOptions: { usePermit2Sig = false, inputTokenPermit } = {},
  chainId,
}) {
  // init router
  const router = new AlphaRouter({
    chainId,
    provider: ethers.provider,
  })

  // parse router args
  const outputAmount = CurrencyAmount.fromRawAmount(
    tokenOut,
    JSBI.BigInt(amoutOut)
  )
  const routeArgs = [
    outputAmount,
    tokenIn,
    TradeType.EXACT_OUTPUT,
    {
      type: SwapType.UNIVERSAL_ROUTER,
      recipient,
      slippageTolerance,
      deadline,
    },
  ]

  // add sig if necessary
  if (usePermit2Sig) routeArgs.inputTokenPermit = inputTokenPermit

  // call router
  const { methodParameters, quote, quoteGasAdjusted, estimatedGasUsedUSD } =
    await router.route(...routeArgs)

  // parse quote as BigNumber
  const amountInMax = currencyAmountToBigNumber(quote)

  // log some prices
  console.log(`Quote Exact: ${quote.toExact()}`)
  console.log(`Quote toFixed: ${quote.toFixed(2)}`)
  console.log(`Gas Adjusted Quote: ${quoteGasAdjusted.toFixed(2)}`)
  console.log(`Gas Used USD: ${estimatedGasUsedUSD.toFixed(6)}`)
  console.log(`AmountInMax: ${amountInMax.toString()}`)

  const { calldata: swapCalldata, value, to: swapRouter } = methodParameters

  return {
    swapCalldata,
    value,
    amountInMax,
    swapRouter,
  }
}

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

/**
 * PERMIT2 helpers
 * */
const makePermit = async (
  tokenAddress,
  amount = ethers.constants.MaxUint256.toString(),
  deadline = Math.floor(new Date().getTime() / 1000 + 100000),
  nonce = '0'
) => {
  const {
    uniswapV3: { routerAddress },
  } = await getNetwork()
  return {
    details: {
      token: tokenAddress,
      amount,
      expiration: deadline.toString(),
      nonce,
    },
    spender: routerAddress,
    sigDeadline: deadline.toString(),
  }
}

async function generatePermitSignature(permit, signer, chainId) {
  const { domain, types, values } = AllowanceTransfer.getPermitData(
    permit,
    PERMIT2_ADDRESS,
    chainId
  )
  return await signer._signTypedData(domain, types, values)
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
  makePermit,
  getTokenInfo,
  getUniswapTokens,
  getUniswapRoute,
  PERMIT2_ADDRESS,
}
