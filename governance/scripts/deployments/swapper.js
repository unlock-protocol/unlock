const { ethers, run } = require('hardhat')
const { PERMIT2_ADDRESS } = require('@uniswap/universal-router-sdk')
const {
  uniswapRouterAddresses,
  getNetwork,
  isLocalhost,
  deployContract,
} = require('@unlock-protocol/hardhat-helpers')
const { UnlockSwapPurchaser } = require('@unlock-protocol/contracts')

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
  const SwapPurchaser = await ethers.getContractFactory(
    UnlockSwapPurchaser.abi,
    UnlockSwapPurchaser.bytecode
  )

  console.log(`   waiting for tx to be mined for contract verification...`)
  const {
    contract: swapPurchaser,
    hash,
    address: swapPurchaserAddress,
  } = await deployContract(
    SwapPurchaser,
    [unlockAddress, PERMIT2_ADDRESS, routers],
    { wait: 5 }
  )
  console.log(`SwapPurchaser deployed at ${swapPurchaserAddress} (tx: ${hash})`)

  if (!(await isLocalhost())) {
    await run('verify:verify', {
      address: await swapPurchaser.getAddress(),
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
