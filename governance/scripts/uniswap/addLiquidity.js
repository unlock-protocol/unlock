const { ethers } = require('hardhat')
const {
  addERC20,
  logBalance,
  BASIS_POINTS,
  getUnlock,
} = require('@unlock-protocol/hardhat-helpers')

const {
  createOrGetUniswapV3Pool,
  addLiquidity,
} = require('../../helpers/uniswap')
const { networks } = require('@unlock-protocol/networks')

// pool fee
const POOL_FEE = 3000

// usd prices
const UDT_USD_PRICE = 9.42
const NATIVE_USD_PRICE = 2001 //10.13

// initial amount of wrapped native token to add as liquidity
const INITIAL_AMOUNT = '0.5'

async function main() {
  const [signer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()

  const {
    nativeCurrency: { wrapped: wrappedNativeAddress },
    unlockAddress,
  } = networks[chainId]

  const unlock = await getUnlock(unlockAddress)
  const udtAddress = await unlock.udt()

  const amountWrapped = ethers.utils.parseUnits(INITIAL_AMOUNT, 18)
  const exchangeRate = Math.round(
    (NATIVE_USD_PRICE * BASIS_POINTS) / UDT_USD_PRICE
  )
  console.log(`Exchange rate for Wrapped <> UDT: ${exchangeRate} bps`)

  // amount to match at prev pool rate
  const amountUDT = amountWrapped.mul(exchangeRate).div(BASIS_POINTS)

  // get the pool
  const pool = await createOrGetUniswapV3Pool(
    wrappedNativeAddress,
    udtAddress,
    POOL_FEE
  )
  console.log(`Pool address: ${pool.address}`)

  console.log(
    ` liquidity to add (Wrapped): ${ethers.utils.formatEther(amountWrapped)}\n`,
    ` liquidity to add (UDT): ${ethers.utils.formatEther(amountUDT)}`
  )

  // make sure we have enough (for testing)
  if (process.env.RUN_FORK) {
    await addERC20(wrappedNativeAddress, signer.address, amountWrapped)
    await addERC20(udtAddress, signer.address, amountUDT)
  }

  // show balances
  await logBalance(wrappedNativeAddress, signer.address)
  await logBalance(udtAddress, signer.address)

  // add position
  const added = await addLiquidity(
    pool,
    [wrappedNativeAddress, amountWrapped],
    [udtAddress, amountUDT]
  )
  console.log(added)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
