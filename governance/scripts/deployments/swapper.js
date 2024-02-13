const { PERMIT2_ADDRESS } = require('@uniswap/universal-router-sdk')
const {
  getNetwork,
  copyAndBuildContractsAtVersion,
  deployContract,
} = require('@unlock-protocol/hardhat-helpers')

async function main() {
  // fetch chain info
  const {
    unlockAddress,
    id: chainId,
    uniswapV3: { universalRouterAddress },
  } = await getNetwork()

  const routers = [universalRouterAddress]

  console.log(`Deploying SwapPurchaser to ${chainId}
  - unlockAddress: ${unlockAddress}
  - PERMIT2_ADDRESS : ${PERMIT2_ADDRESS}
  - routers: ${routers}`)

  if (!universalRouterAddress) {
    console.log('`universalRouterAddress` undefined for this network')
    return
  }

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
