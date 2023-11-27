const { ethers } = require('hardhat')
const {
  addERC20,
  logBalance,
  BASIS_POINTS,
  UDT,
  WETH,
} = require('@unlock-protocol/hardhat-helpers')

const { createUniswapV3Pool, addLiquidity } = require('../../helpers/uniswap')

// create pool
const POOL_FEE = 3000

// calculate rate from existing `getReserves()` on mainnet pool '0x9ca8aef2372c705d6848fdda3c1267a7f51267c1'
const [reserveUDT, reserveWETH] = [
  ethers.BigNumber.from(`7043336789457615457636`),
  ethers.BigNumber.from(`35739020833764974774`),
]
const poolRate = reserveUDT.div(reserveWETH).mul(BASIS_POINTS)

async function main() {
  const [signer] = await ethers.getSigners()

  // amount to add as liquidity
  const amountWETH = ethers.utils.parseUnits('0.5', 18)

  // amount to match at prev pool rate
  const amountUDT = amountWETH.mul(poolRate).div(BASIS_POINTS)

  // create the pool
  const pool = await createUniswapV3Pool(WETH, UDT, poolRate, POOL_FEE)
  console.log(`poolAddress: ${pool.address}`)

  console.log(
    `liquidity to add (WETH): ${ethers.utils.formatEther(amountWETH)} WETH \n`,
    `liquidity to add (UDT): ${ethers.utils.formatEther(amountUDT)} UDT`
  )

  // make sure we have enough (for testing)
  if (process.env.RUN_FORK) {
    await addERC20(WETH, signer.address, amountWETH)
    await addERC20(UDT, signer.address, ethers.utils.formatEther(amountUDT))
  }

  // show balances
  await logBalance(WETH, signer.address)
  await logBalance(UDT, signer.address)

  // add position
  const added = await addLiquidity(pool, [WETH, amountWETH], [UDT, amountUDT])
  console.log(added)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
