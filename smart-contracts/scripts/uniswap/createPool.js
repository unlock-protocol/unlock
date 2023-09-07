const { ethers } = require('hardhat')
const {
  createUniswapV3Pool,
  addLiquidity,
  logBalance,
  UDT,
  DAI,
  addUDT,
  addERC20,
} = require('../../test/helpers')

const creditTokens = async (tokenAddress, amount) => {
  const [signer] = await ethers.getSigners()
  const token = await ethers.getContractAt('TestERC20', tokenAddress, signer)
  if (tokenAddress === UDT) {
    await addUDT(signer.address, amount)
  } else {
    await addERC20(tokenAddress, signer.address, amount)
  }
  return token
}

async function main() {
  const pool = await createUniswapV3Pool(UDT, DAI)
  console.log(`poolAddress: ${pool.address}`)

  // amount to add as liquidity
  const amountA = ethers.utils.parseUnits('500', 18)
  const amountB = ethers.utils.parseUnits('500', 18)

  if (process.env.RUN_FORK) {
    await creditTokens(UDT, amountA.mul(2))
    await creditTokens(DAI, amountB.mul(2))
  }
  const [signer] = await ethers.getSigners()
  await logBalance(UDT, signer.address)
  await logBalance(DAI, signer.address)

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
