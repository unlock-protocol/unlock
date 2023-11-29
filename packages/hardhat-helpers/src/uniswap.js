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
const { getNetwork } = require('./unlock')

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
  amoutOut = ethers.utils.parseUnits('10', tokenOut.decimals),
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
  const { DAI, WETH, USDC, UDT, WBTC } = await getTokens()

  return {
    native: nativeOnChain(chainId),
    dai: new Token(chainId, DAI, 18, 'DAI'),
    weth: new Token(chainId, WETH, 18, 'WETH'),
    usdc: new Token(chainId, USDC, 6, 'USDC'),
    udt: new Token(chainId, UDT, 18, 'UDT'),
    wBtc: new Token(chainId, WBTC, 18, 'wBTC'),
  }
}

const routerAddresses = {
  421613: {
    UniversalRouter: '0x4648a43B2C14Da09FdF82B161150d3F634f40491',
    UnsupportedProtocol: '0x5302086A3a25d473aAbBd0356eFf8Dd811a4d89B',
    SwapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
  },
  42161: {
    UniversalRouter: '0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5',
    UnsupportedProtocol: '0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B',
    SwapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
  },
  56: {
    UniversalRouter: '0x4648a43B2C14Da09FdF82B161150d3F634f40491',
    UnsupportedProtocol: '0x5302086A3a25d473aAbBd0356eFf8Dd811a4d89B',
    SwapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
  },
  44787: {
    UniversalRouter: '0x4648a43B2C14Da09FdF82B161150d3F634f40491',
    UnsupportedProtocol: '0x5302086A3a25d473aAbBd0356eFf8Dd811a4d89B',
    SwapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
  },
  42220: {
    UniversalRouter: '0xC73d61d192FB994157168Fb56730FdEc64C9Cb8F',
    UnsupportedProtocol: '0x5Dc88340E1c5c6366864Ee415d6034cadd1A9897',
    SwapRouter02: '0x5615CDAb10dc425a742d643d949a7F474C01abc4',
  },
  5: {
    UniversalRouter: '0x4648a43B2C14Da09FdF82B161150d3F634f40491',
    UnsupportedProtocol: '0x5302086A3a25d473aAbBd0356eFf8Dd811a4d89B',
    SwapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
  },
  1: {
    UniversalRouter: '0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B',
    SwapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
  },
  420: {
    UniversalRouter: '0x4648a43B2C14Da09FdF82B161150d3F634f40491',
    UnsupportedProtocol: '0x5302086A3a25d473aAbBd0356eFf8Dd811a4d89B',
    SwapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
  },
  10: {
    UniversalRouter: '0xb555edF5dcF85f42cEeF1f3630a52A108E55A654',
    UnsupportedProtocol: '0x40d51104Da22E3e77b683894E7e3E12e8FC61E65',
    SwapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
  },
  80001: {
    UniversalRouter: '0x4648a43B2C14Da09FdF82B161150d3F634f40491',
    UnsupportedProtocol: '0x5302086A3a25d473aAbBd0356eFf8Dd811a4d89B',
    SwapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
  },
  137: {
    UniversalRouter: '0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5',
    UnsupportedProtocol: '0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B',
    SwapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
  },
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
  uniswapRouterAddresses: routerAddresses,
  getUniswapTokens,
  getUniswapRoute,
  PERMIT2_ADDRESS,
}
