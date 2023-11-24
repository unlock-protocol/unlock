const { ethers } = require('hardhat')
const {
  addERC20,
  logBalance,
  BASIS_POINTS,
  UDT,
  WETH,
} = require('@unlock-protocol/hardhat-helpers')

const { createUniswapV3Pool, addLiquidity } = require('../../helpers/uniswap')

async function main({ tokenA = WETH, tokenB = UDT } = {}) {
  const [signer] = await ethers.getSigners()

  // create pool
  const POOL_FEE = 3000

  // calculate rate
  // const UDT_PRICE = 942 // USD cents
  // const WETH_PRICE = 210629 // ETH in USD cents

  const POOL_RATE = Math.round(7500 / 33) // in basis points
  const pool = await createUniswapV3Pool(tokenA, tokenB, 33, 7500, POOL_FEE)
  console.log(`poolAddress: ${pool.address}`)

  await logBalance(tokenA, signer.address)
  await logBalance(tokenB, signer.address)

  // amount to add as liquidity
  const amountA = ethers.utils.parseUnits('50', 18)
  const amountB = amountA.mul(POOL_RATE).div(BASIS_POINTS)

  console.log(
    `liquidity A: ${ethers.utils.formatEther(amountA)} ${tokenA.symbol} \n`,
    `liquidity B: ${ethers.utils.formatEther(amountB)} ${tokenB.symbol}`
  )

  // make sure we have enough for testing
  if (process.env.RUN_FORK) {
    await addERC20(tokenA, signer.address, amountA)
    await addERC20(tokenB, signer.address, amountB)
  }

  await logBalance(tokenA, signer.address)
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
