/**
 * Simple script to retrieve a Uniswap route using ther smart router
 * */
const { ethers } = require('hardhat')
const { AlphaRouter, nativeOnChain, SwapType } = require('@uniswap/smart-order-router')
const { Token, CurrencyAmount, TradeType, Percent  } = require('@uniswap/sdk-core')
const JSBI  = require('jsbi')
const { DAI, WETH, SHIBA_INU, USDC, UDT } = require('../../test/helpers')

// parse tokens
const getTokens = (chainId) => ({
  native: nativeOnChain(chainId),
  dai: new Token(chainId, DAI, 18, 'DAI'),
  weth: new Token(chainId, WETH, 18, 'WETH'),
  shiba: new Token(chainId, SHIBA_INU, 18, 'SHIBA'),
  usdc: new Token(chainId, USDC, 6, 'USDC'),
  udt: new Token(chainId, UDT, 18, 'UDT')
  // wBTC
})

async function uniswap (tokenIn, tokenOut, chainId = 1) {
  
  console.log(`${tokenIn.symbol} > ${tokenOut.symbol}`)

  // pick tokens to swap
  const keyPrice = ethers.utils.parseUnits('10', tokenOut.decimals)

  // init router
  const router = new AlphaRouter({ 
    chainId, 
    provider: ethers.provider,
  })

  // parse router args 
  const [signer] = await ethers.getSigners()
  const outputAmount = CurrencyAmount.fromRawAmount(tokenOut, JSBI.BigInt(keyPrice))
  const args = {
    outputAmount,
    quoteCurrency: tokenIn,
    swapType: TradeType.EXACT_OUTPUT,
    swapConfig: {
      type: SwapType.UNIVERSAL_ROUTER,
      recipient: signer.address,
      slippageTolerance: new Percent(5, 100),
      deadline: Date.now() + 1800
    }
  }

  // call router
  const route = await router.route(
    ...Object.values(args)
  )
  
  // log some prices
  console.log(`Quote Exact In: ${route.quote.toFixed(2)}`);
  console.log(`Gas Adjusted Quote In: ${route.quoteGasAdjusted.toFixed(2)}`);
  console.log(`Gas Used USD: ${route.estimatedGasUsedUSD.toFixed(6)}`);
}

async function main() {
  
  // parse tokens
  const { chainId } = await ethers.provider.getNetwork()
  const tokens = Object.values(getTokens(chainId))

  let pairs = []
  tokens.forEach(t0 => tokens.forEach(t1 => pairs.push([t0, t1])))
  
  pairs = pairs.filter(p => p[0] !== p[1])

  for (let i = 0; i < pairs.length; i++) {
    console.log('-------------------------')
    const pair = pairs[i];
    try {
      await uniswap(...pair)  
    } catch (error) {
      console.log(error)
    }

  }

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
