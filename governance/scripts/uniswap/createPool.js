const { ethers } = require('hardhat')
const {
  addERC20,
  logBalance,
  BASIS_POINTS,
  UDT,
  WETH,
} = require('@unlock-protocol/hardhat-helpers')

const { createUniswapV3Pool, addLiquidity } = require('../../helpers/uniswap')

async function main() {
  const [signer] = await ethers.getSigners()

  // create pool
  const POOL_FEE = 3000

  // calculate rate from existing mainnet pool
  const UDT_AMOUNT = 7500 //
  const WETH_AMOUNT = 33.54 // ETH in USD cents
  const POOL_RATE = Math.round(UDT_AMOUNT / WETH_AMOUNT) * BASIS_POINTS

  const pool = await createUniswapV3Pool(
    WETH,
    UDT,
    UDT_AMOUNT,
    WETH_AMOUNT,
    POOL_FEE
  )
  console.log(`poolAddress: ${pool.address}`)

  await logBalance(WETH, signer.address)
  await logBalance(UDT, signer.address)

  // amount to add as liquidity
  const amountWETH = ethers.utils.parseUnits('0.5', 18)
  const amountUDT = amountWETH.mul(POOL_RATE).div(BASIS_POINTS)

  console.log(
    `liquidity WETH: ${ethers.utils.formatEther(amountWETH)} ${WETH.symbol} \n`,
    `liquidity UDT: ${ethers.utils.formatEther(amountUDT)} ${UDT.symbol}`
  )

  // make sure we have enough for testing
  if (process.env.RUN_FORK) {
    await addERC20(WETH, signer.address, amountWETH)
    await addERC20(UDT, signer.address, amountUDT)
  }

  await logBalance(WETH, signer.address)
  await logBalance(UDT, signer.address)

  const added = await addLiquidity(pool, amountWETH, amountUDT)
  console.log(added)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
