const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')
const setOracle = require('./unlock-oracle')

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  const { tokens } = networks[chainId]

  for (const token of tokens) {
    if (token.symbol !== 'WETH') {
      console.log(`Setting ${token.name} (${token.symbol}) at ${token.address}`)
      await setOracle({
        tokenAddress: token.address,
      })
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
