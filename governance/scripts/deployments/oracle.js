const {
  getNetwork,
  deployContract,
  copyAndBuildContractsAtVersion,
} = require('@unlock-protocol/hardhat-helpers')

// TODO: check if oracle has already been deployed and skips if one already exists!
async function main({ uniswapFactoryAddress, fee = 500 } = {}) {
  if (!uniswapFactoryAddress) {
    const {
      uniswapV3: { factoryAddress },
    } = await getNetwork()
    uniswapFactoryAddress = factoryAddress
  }

  if (!uniswapFactoryAddress) {
    // eslint-disable-next-line no-console
    throw new Error(
      'UNISWAP ORACLE > Missing Uniswap Factory address... aborting.'
    )
  }

  const [qualifiedPath] = await copyAndBuildContractsAtVersion(__dirname, [
    { contractName: 'UniswapOracleV3', subfolder: 'utils' },
  ])

  const { hash, address: oracleAddress } = await deployContract(
    qualifiedPath,
    [uniswapFactoryAddress, fee],
    { wait: 3 }
  )
  console.log(
    `UNISWAP ORACLE > Oracle deployed at ${oracleAddress} with ${uniswapFactoryAddress} (tx: ${hash})`
  )

  return oracleAddress
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
