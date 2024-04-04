const { ethers } = require('hardhat')
const {
  getNetwork,
  getERC20Contract,
} = require('@unlock-protocol/hardhat-helpers')
const { UniswapOracleV3 } = require('@unlock-protocol/contracts')

async function main({ tokenIn = 'POINTS', tokenOut, amount = '1' } = {}) {
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
  let tokenTo
  if (!tokenOut) {
    const wrapped = await getERC20Contract(wrappedNativeAddress)
    const wrappedSymbol = await wrapped.symbol()
    tokenTo = { address: wrappedNativeAddress, symbol: wrappedSymbol }
  } else {
    tokenTo = tokens.find((token) => token.symbol === tokenOut)
    if (!tokenTo) {
      throw new Error(
        `Token ${tokenOut} is not defined in the networks package.`
      )
    }
  }

  const tokenFrom = tokens.find((token) => token.symbol === tokenIn)
  if (!tokenFrom) {
    throw new Error(`Token ${tokenIn} is not defined in the networks package.`)
  }

  // check if token can be retrieved through Uniswap V3 oracle
  const oracle = await ethers.getContractAt(UniswapOracleV3.abi, oracleAddress)
  console.log(
    `Checking oracle for ${tokenFrom.symbol}/${tokenTo.symbol} (${amount})`
  )
  const rate = await oracle.consult(
    tokenFrom.address,
    ethers.parseUnits(amount, tokenFrom.decimals),
    tokenTo.address
  )
  if (rate === 0n) {
    console.log(`Uniswap V3 pool not found`)
  } else {
    console.log(
      `Current rate (~last hour) : ${ethers.formatUnits(
        rate,
        tokenTo.decimals
      )} ${tokenTo.symbol} for ${amount} ${tokenIn.symbol}`
    )
  }
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
