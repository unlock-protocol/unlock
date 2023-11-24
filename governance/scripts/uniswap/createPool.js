const { ethers } = require('hardhat')
const {
  addERC20,
  getBalance,
  BASIS_POINTS,
  UDT,
  DAI,
  // WETH
} = require('@unlock-protocol/hardhat-helpers')

const {
  createUniswapV3Pool,
  getTokenInfo,
  addLiquidity,
} = require('../../helpers/uniswap')

async function logBalance(tokenAddress, account) {
  const balance = await getBalance(account, tokenAddress)
  const { symbol } = await getTokenInfo(tokenAddress)
  console.log(` balance ${symbol}: `, balance.toString())
}

async function main({ tokenA = DAI, tokenB = UDT } = {}) {
  const [signer] = await ethers.getSigners()

  // create pool
  const POOL_FEE = 500
  const POOL_RATE = 12
  const pool = await createUniswapV3Pool(tokenA, tokenB, POOL_RATE, POOL_FEE)
  console.log(`poolAddress: ${pool.address}`)

  await logBalance(tokenA, signer.address)
  await logBalance(tokenB, signer.address)

  // amount to add as liquidity
  const amountA = ethers.utils.parseUnits('50', 18)
  const amountB = amountA.mul(POOL_RATE).div(BASIS_POINTS)

  console.log({
    amountA: `${ethers.utils.formatEther(amountA)} ${amountA}`,
    amountB: `${ethers.utils.formatEther(amountB)} ${amountB}`,
  })

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
