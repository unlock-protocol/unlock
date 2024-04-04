const { ethers } = require('hardhat')
const {
  getNetwork,
  getERC20Contract,
} = require('@unlock-protocol/hardhat-helpers')
const { UniswapOracleV3 } = require('@unlock-protocol/contracts')

async function main({
  tokenIn = 'POINTS',
  tokenOut,
  defaultAmount = '1',
} = {}) {
  const {
    nativeCurrency: { wrapped: wrappedNativeAddress },
    uniswapV3: { oracle: oracleAddress },
    tokens,
  } = await getNetwork()

  if (!oracleAddress) {
    throw new Error(
      'No address for oracle in the networks package, please add one.'
    )
  }

  // check wrapped
  if (!tokenOut) {
    const wrapped = await getERC20Contract(wrappedNativeAddress)
    const wrappedSymbol = await wrapped.symbol()
    tokenOut = { address: wrappedNativeAddress, symbol: wrappedSymbol }
  } else {
    tokenOut = tokens.find((token) => token.symbol === tokenOut)
  }

  const token = tokens.find((token) => token.symbol === tokenIn)

  // check if token can be retrieved through Uniswap V3 oracle
  const oracle = await ethers.getContractAt(UniswapOracleV3.abi, oracleAddress)
  const amount = ethers.parseUnits(defaultAmount, token.decimals)
  console.log(
    `Checking oracle for ${token.symbol}/${tokenOut.symbol} (${defaultAmount})`
  )
  const rate = await oracle.consult(token.address, amount, tokenOut.address)
  console.log(rate)
}

// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
