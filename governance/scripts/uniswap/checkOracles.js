const checkOracle = require('./oracle')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')

const logError = (name, chainId, msg) =>
  console.log(`[${name} (${chainId})]: ${msg}`)

async function main() {
  const { name, id, uniswapV3, tokens } = await getNetwork()
  if (uniswapV3 && uniswapV3.oracle) {
    for (let i in tokens) {
      const token = tokens[i]
      const info = `${token.symbol} (${token.address}) - oracle: ${uniswapV3.oracle}`
      if (token.symbol !== 'WETH') {
        try {
          const rate = await checkOracle({ tokenIn: token.symbol, quiet: true })
          if (rate === 0n) {
            logError(name, id, `Missing Uniswap Pool: ${info}`)
          }
        } catch (error) {
          logError(name, id, `Failed to fetch: ${info} - ${error.message}`)
        }
      }
    }
  }
}

// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
