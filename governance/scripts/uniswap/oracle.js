const { ethers } = require('hardhat')
const {
  getNetwork,
  getERC20Contract,
} = require('@unlock-protocol/hardhat-helpers')
const { UniswapOracleV3 } = require('@unlock-protocol/contracts')

async function main({
  tokenIn = 'UDT',
  tokenOut,
  amount = '1',
  oracleAddress,
} = {}) {
  const network = await getNetwork()
  const {
    nativeCurrency: { wrapped: wrappedNativeAddress },
    tokens,
  } = network

  if (!oracleAddress) {
    ;({
      uniswapV3: { oracle: oracleAddress },
    } = network)
  }
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

  let tokenFrom
  // get UDT address from package
  if (tokenIn === 'UDT') {
    const {
      unlockDaoToken: { address: udtAddress },
    } = network
    tokenFrom = { address: udtAddress, symbol: 'UDT' }
  } else {
    tokenFrom = tokens.find((token) => token.symbol === tokenIn)
  }

  if (!tokenFrom) {
    throw new Error(`Token ${tokenIn} is not defined in the networks package.`)
  }

  const pair = `${tokenFrom.symbol}/${tokenTo.symbol}`
  // check if token can be retrieved through Uniswap V3 oracle
  const oracle = await ethers.getContractAt(UniswapOracleV3.abi, oracleAddress)
  console.log(`Checking oracle ${oracleAddress} for ${pair} (${amount})`)
  const rate = await oracle.consult(
    tokenFrom.address,
    ethers.parseUnits(amount, tokenFrom.decimals),
    tokenTo.address
  )
  if (rate === 0n) {
    console.log(
      `Uniswap values are null using:
      - tokenA: ${tokenFrom.address} (${tokenFrom.symbol})
      - tokenB: ${tokenTo.address} (${tokenTo.symbol})
      - uniswapFactory: ${await oracle.factory()}`
    )

    const factory = await ethers.getContractAt(
      ['function getPool(address,address,uint24) view returns (address)'],
      await oracle.factory()
    )

    const poolAddress = await factory.getPool(
      tokenFrom.address,
      tokenTo.address,
      500
    )
    console.log(`Uniswap pool: ${poolAddress}`)
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
