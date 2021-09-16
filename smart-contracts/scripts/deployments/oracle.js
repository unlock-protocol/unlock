const { ethers } = require('hardhat')
const UniswapOracle = require('hardlydifficult-eth/build/contracts/UniswapOracle.json')

async function main({ uniswapRouterAddress }) {
  if (!uniswapRouterAddress) {
    // eslint-disable-next-line no-console
    console.log('UNISWAP ORACLE > Missing Uniswap Router address... aborting.')
    return
  }
  const Oracle = await ethers.getContractFactory(
    UniswapOracle.abi,
    UniswapOracle.bytecode
  )
  const oracle = await Oracle.deploy(uniswapRouterAddress)
  await oracle.deployed()

  // eslint-disable-next-line no-console
  console.log('UNISWAP ORACLE > Oracle deployed at:', oracle.address)

  return oracle.address
}

// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
