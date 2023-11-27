const { ethers } = require('hardhat')
const {
  addERC20,
  logBalance,
  BASIS_POINTS,
  UDT,
} = require('@unlock-protocol/hardhat-helpers')

const { createUniswapV3Pool, addLiquidity } = require('../../helpers/uniswap')
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
    unlockDiscountToken,
  } = networks[chainId]

  console.log({ unlockDiscountToken, wrappedNativeAddress })

  const amountWrapped = ethers.utils.parseUnits(INITIAL_AMOUNT, 18)

  // rates can be taken from existing `getReserves()` on mainnet pool '0x9ca8aef2372c705d6848fdda3c1267a7f51267c1'
  const nativePriceInUSD = ethers.utils.parseEther(
    `${Math.round(NATIVE_USD_PRICE * BASIS_POINTS)}`
  )
  const udtPriceInUSD = ethers.utils.parseEther(
    `${Math.round(UDT_USD_PRICE * BASIS_POINTS)}`
  )

  const poolRate = nativePriceInUSD.mul(BASIS_POINTS).div(udtPriceInUSD)

  // amount to match at prev pool rate
  const amountUDT = amountWrapped.mul(poolRate).div(BASIS_POINTS)

  // create the pool
  const pool = await createUniswapV3Pool(
    wrappedNativeAddress,
    unlockDiscountToken,
    poolRate,
    POOL_FEE
  )
  console.log(`poolAddress: ${pool.address}`)

  console.log(
    `liquidity to add (WETH): ${ethers.utils.formatEther(amountWrapped)} \n`,
    `liquidity to add (UDT): ${ethers.utils.formatEther(amountUDT)}`
  )

  // make sure we have enough (for testing)
  if (process.env.RUN_FORK) {
    await addERC20(wrappedNativeAddress, signer.address, amountWrapped)
    await addERC20(
      unlockDiscountToken,
      signer.address,
      ethers.utils.formatEther(amountUDT)
    )
  }

  // show balances
  await logBalance(wrappedNativeAddress, signer.address)
  await logBalance(unlockDiscountToken, signer.address)

  // add position
  const added = await addLiquidity(
    pool,
    [wrappedNativeAddress, amountWrapped],
    [unlockDiscountToken, amountUDT]
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
