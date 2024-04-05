const { PERMIT2_ADDRESS } = require('@uniswap/universal-router-sdk')
const {
  getNetwork,
  deployContract,
  copyAndBuildContractsAtVersion,
} = require('@unlock-protocol/hardhat-helpers')

async function main() {
  // fetch chain info

  const {
    unlockAddress,
    id: chainId,
    uniswapV3: { swapRouter02: swapRouter02 },
  } = await getNetwork()

  console.log(`Deploying UnlockSwapBurner on ${chainId}
  - unlockAddress: ${unlockAddress}
  - PERMIT2_ADDRESS : ${PERMIT2_ADDRESS}
  - swapRouter02: ${swapRouter02}`)

  if (!swapRouter02) {
    throw Error('Uniswap undefined for this network')
  }

  const [qualifiedPath] = await copyAndBuildContractsAtVersion(__dirname, [
    { contractName: 'UnlockSwapBurner', subfolder: 'utils' },
  ])

  console.log(` waiting for tx to be mined for contract verification...`)
  const { address: swapperAddress } = await deployContract(
    qualifiedPath,
    [unlockAddress, PERMIT2_ADDRESS, swapRouter02],
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
