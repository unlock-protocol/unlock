const { ethers } = require('hardhat')

const { createOrGetUniswapV3Pool } = require('../../helpers/uniswap')
const { networks } = require('@unlock-protocol/networks')
const { getUnlock } = require('@unlock-protocol/hardhat-helpers')

const POOL_FEE = 3000

async function main() {
  const { chainId } = await ethers.provider.getNetwork()

  const {
    nativeCurrency: { wrapped: wrappedNativeAddress },
    unlockAddress,
  } = networks[chainId]

  const unlock = await getUnlock(unlockAddress)
  const udtAddress = await unlock.udt()

  // create the pool
  const pool = await createOrGetUniswapV3Pool(
    wrappedNativeAddress,
    udtAddress,
    POOL_FEE
  )

  console.log(`poolAddress: ${pool.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
