// const { ehters } = require('hardhat')
const { createUniswapV3Pool, addLiquidity } = require('../../test/helpers')

async function main() {
  const pool = await createUniswapV3Pool()
  console.log(`poolAddress: ${pool.address}`)

  const added = await addLiquidity(pool)
  console.log(added)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
