/**
 * Simple script to retrieve Uniswap route for a bunch of pairs
 * (using their smart router) 
 * */
const { ethers } = require('hardhat')
const { getUniswapRoute, getUniswapTokens } = require('../../test/helpers')

async function main() {
  
  // parse tokens

  const { chainId } = await ethers.provider.getNetwork()
  const tokens = getUniswapTokens(chainId)

  const pair = [tokens.usdc, tokens.native]
  try {
    await getUniswapRoute(...pair)
  } catch (error) {
    console.log(error)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
