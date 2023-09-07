const { ethers } = require('hardhat')
const {
  createUniswapV3Pool,
  addLiquidity,
  logBalance,
  UDT,
  // DAI,
  WETH,
  BASIS_POINTS,
  addUDT,
  addERC20,
} = require('../../test/helpers')

async function main({ tokenB = WETH } = {}) {
  const [signer] = await ethers.getSigners()

  // create pool
  const POOL_FEE = 500
  const POOL_RATE = 12
  const pool = await createUniswapV3Pool(UDT, tokenB, POOL_RATE, POOL_FEE)
  console.log(`poolAddress: ${pool.address}`)

  await logBalance(UDT, signer.address)
  await logBalance(tokenB, signer.address)

  // amount to add as liquidity
  const amountA = ethers.utils.parseUnits('50', 18)
  const amountB = amountA.mul(POOL_RATE).div(BASIS_POINTS)

  console.log(
    `UDT: ${ethers.utils.formatEther(amountA)} ${amountA} \n`,
    ethers.utils.formatEther(amountB),
    amountB
  )

  if (process.env.RUN_FORK) {
    await addUDT(signer.address, amountA)
    await addERC20(tokenB, signer.address, amountB) // make sure we have enough
  }

  await logBalance(UDT, signer.address)
  await logBalance(tokenB, signer.address)

  const added = await addLiquidity(pool, amountA, amountB)
  console.log(added)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
