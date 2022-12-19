/**
 * Simple script to retrieve a Uniswap route using ther smart router
 * */
const { ethers } = require('hardhat')
const { AlphaRouter } = require('@uniswap/smart-order-router')
const { Token, NativeCurrency, CurrencyAmount, TradeType  } = require('@uniswap/sdk-core')
const { encodeRouteToPath } = require('@uniswap/v3-sdk')
const JSBI  = require('jsbi')
const { DAI, WETH, SHIBA_INU, USDC } = require('../../test/helpers')

// uniswap config
const tokens = {
  eth: new NativeCurrency(
    1,
    18,
    'ETH'
  ),
  dai: new Token(
    1,
    DAI,
    18,
    'DAI'
  ),
  weth: new Token(
    1,
    WETH,
    18,
    'WETH'
  ),
  shiba: new Token(
    1,
    SHIBA_INU,
    18,
    'SHIBA'
  ),
  usdc: new Token(
    1,
    USDC,
    6,
    'USDC'
  )
}

async function main() {
  const router = new AlphaRouter({ chainId: 1, 
    provider: ethers.provider
  })

  const keyPrice = ethers.utils.parseEther('.1')
  const outputAmount = CurrencyAmount.fromRawAmount(tokens.shiba, JSBI.BigInt(keyPrice))
  const args = {
    outputAmount,
    quoteCurrency: tokens.weth,
    swapType: TradeType.EXACT_OUTPUT,
    // swapConfig: {
    //   // recipient: keyOwner.address,
    //   // slippageTolerance,
    //   // deadline: Math.floor(Date.now()/1000 + 1800)
    // }
  }

  

  const route = await router.route(
      ...Object.values(args)
  )
    
  
  const bestRoute = route.route[0].route
  console.log(route.route[0].route)
  

  const path = encodeRouteToPath(bestRoute, TradeType.EXACT_OUTPUT)
  console.log(path)
  

  console.log(`Quote Exact In: ${route.quote.toFixed(2)}`);
  console.log(`Gas Adjusted Quote In: ${route.quoteGasAdjusted.toFixed(2)}`);
  console.log(`Gas Used USD: ${route.estimatedGasUsedUSD.toFixed(6)}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
