const { ethers, run } = require('hardhat')
const { PERMIT2_ADDRESS } = require('@uniswap/universal-router-sdk')
const {
  getNetwork,
  isLocalhost,
  deployContract,
} = require('@unlock-protocol/hardhat-helpers')
const { UnlockSwapBurner } = require('@unlock-protocol/contracts')

async function main() {
  // fetch chain info

  const {
    unlockAddress,
    id: chainId,
    uniswapV3: { universalRouterAddress: routerAddress },
  } = await getNetwork()

  console.log(`Deploying SwapAndBurn to ${chainId}
  - unlockAddress: ${unlockAddress}
  - PERMIT2_ADDRESS : ${PERMIT2_ADDRESS}
  - routerAddress: ${routerAddress}`)

  if (!routerAddress) {
    throw Error('Uniswap undefined for this network')
  }

  console.log(
    `Deploying UnlockSwapBurner on chain ${chainId} (unlock: ${unlockAddress}, permit2: ${PERMIT2_ADDRESS}, routerAddress: ${routerAddress.toString()}) `
  )
  const SwapAndBurn = await ethers.getContractFactory(
    UnlockSwapBurner.abi,
    UnlockSwapBurner.bytecode
  )

  console.log(`   waiting for tx to be mined for contract verification...`)
  const {
    contract: swapper,
    hash,
    address: swapperAddress,
  } = await deployContract(
    SwapAndBurn,
    [unlockAddress, PERMIT2_ADDRESS, routerAddress],
    { wait: 5 }
  )

  console.log(`SwapAndBurn deployed at ${swapperAddress} (tx: ${hash})`)

  if (!(await isLocalhost())) {
    await run('verify:verify', {
      address: await swapper.getAddress(),
      constructorArguments: [unlockAddress, PERMIT2_ADDRESS, routerAddress],
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
