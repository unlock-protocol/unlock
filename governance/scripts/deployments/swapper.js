const { ethers, run } = require('hardhat')
const { PERMIT2_ADDRESS } = require('@uniswap/universal-router-sdk')
const {
  uniswapRouterAddresses,
  getNetwork,
} = require('@unlock-protocol/hardhat-helpers')
const { UnlockSwapPurchaser } = require('@unlock-protocol/contracts')

async function main() {
  // fetch chain info
  const { unlockAddress, id: chainId } = await getNetwork()

  const routers = Object.values(uniswapRouterAddresses[chainId])
  console.log(`Deploying Swapper to ${chainId}
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
  const Swapper = await ethers.getContractFactory(
    UnlockSwapPurchaser.abi,
    UnlockSwapPurchaser.bytecode
  )

  const swapper = await Swapper.deploy(unlockAddress, PERMIT2_ADDRESS, routers)
  console.log(`  swapper deployed at ${swapper.address}`)

  if (chainId !== 31337) {
    console.log(`   waiting for tx to be mined for contract verification...`)
    await swapper.waitForDeployment(5)
    await run('verify:verify', {
      address: await swapper.getAddress(),
      constructorArguments: [unlockAddress, PERMIT2_ADDRESS, routers],
    })
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
