const {
  getNetwork,
  PERMIT2_ADDRESS,
  deployContract,
  copyAndBuildContractsAtVersion,
} = require('@unlock-protocol/hardhat-helpers')

async function main() {
  // fetch chain info

  const {
    unlockAddress,
    id: chainId,
    uniswapV3: { universalRouterAddress: routerAddress },
  } = await getNetwork()

  console.log(`Deploying UnlockSwapBurner to ${chainId}
  - unlockAddress: ${unlockAddress}
  - PERMIT2_ADDRESS : ${PERMIT2_ADDRESS}
  - routerAddress: ${routerAddress}`)

  if (!routerAddress) {
    throw Error('Uniswap undefined for this network')
  }

  console.log(
    `Deploying UnlockSwapBurner on chain ${chainId} (unlock: ${unlockAddress}, permit2: ${PERMIT2_ADDRESS}, routerAddress: ${routerAddress.toString()}) `
  )
  const [qualifiedPath] = await copyAndBuildContractsAtVersion(__dirname, [
    { contractName: 'UnlockSwapBurner', subfolder: 'utils' },
  ])

  console.log(` waiting for tx to be mined for contract verification...`)
  const { address: swapperAddress } = await deployContract(
    qualifiedPath,
    [unlockAddress, PERMIT2_ADDRESS, routerAddress],
    { wait: 5 }
  )

  console.log(`SwapAndBurn deployed at ${swapperAddress}`)
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
