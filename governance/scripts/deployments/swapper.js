const { PERMIT2_ADDRESS } = require('@uniswap/universal-router-sdk')
const {
  uniswapRouterAddresses,
  getNetwork,
  copyAndBuildContractsAtVersion,
  deployContract,
} = require('@unlock-protocol/hardhat-helpers')

async function main() {
  // fetch chain info
  const { unlockAddress, id: chainId } = await getNetwork()

  const routers = Object.values(uniswapRouterAddresses[chainId])
  console.log(`Deploying SwapPurchaser to ${chainId}
  - unlockAddress: ${unlockAddress}
  - PERMIT2_ADDRESS : ${PERMIT2_ADDRESS}
  - routers: ${routers}`)

  if (!routers.length) {
    console.log('Uniswap undefined for this network')
    return
  }

  console.log(
    `Deploying UnlockSwapPurchaser on chain ${chainId} (unlock: ${unlockAddress}, permit2: ${PERMIT2_ADDRESS}, routers: ${routers.toString()}) `
  )

  const [qualifiedPath] = await copyAndBuildContractsAtVersion(__dirname, [
    { contractName: 'UnlockSwapPurchaser', subfolder: 'utils' },
  ])

  const { hash, address: swapPurchaserAddress } = await deployContract(
    qualifiedPath,
    [unlockAddress, PERMIT2_ADDRESS, routers],
    { wait: 5 }
  )
  console.log(`SwapPurchaser deployed at ${swapPurchaserAddress} (tx: ${hash})`)
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
