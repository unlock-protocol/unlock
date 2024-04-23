const checkOracle = require('./oracle')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')

async function main() {
  const {
    uniswapV3: { oracle: oracleAddress },
    tokens,
  } = await getNetwork()
  if (oracleAddress) {
    console.log(`checking oracle at ${oracleAddress}`)
    for (let i in tokens) {
      const token = tokens[i]
      if (token.symbol !== 'WETH') {
        try {
          const rate = await checkOracle({ tokenIn: token.symbol })
          if (rate === 0n) {
            console.log(`Missing: ${token.symbol}`)
          }
        } catch (error) {
          console.log(`Failing: ${token.symbol} (oracle: ${oracleAddress})`)
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
