/**
 * Simple script to retrieve Uniswap route for a bunch of pairs
 * (using their smart router) 
 * */
const { ethers } = require('hardhat')
const { getUniswapRoute, getUniswapTokens } = require('../../test/helpers')

async function main() {
  
  // parse tokens
  const { chainId } = await ethers.provider.getNetwork()
  const tokens = Object.values(getUniswapTokens(chainId))

  // parse paris
  let pairs = []
  tokens.forEach(t0 => tokens.forEach(t1 => pairs.push([t0, t1])))
  // remove duplicates
  pairs = pairs.filter(p => p[0] !== p[1])

  for (let i = 0; i < pairs.length; i++) {
    console.log('-------------------------')
    const pair = pairs[i];
    try {
      await getUniswapRoute(...pair)
    } catch (error) {
      console.log(error)
    }

  }

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
