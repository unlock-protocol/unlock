const { ethers } = require('hardhat')
const {
  getNetwork,
  getUnlock,
  getERC20Contract,
  ADDRESS_ZERO,
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

  // check wrapped
  let tokenTo
  if (!tokenOut) {
    if (!wrappedNativeAddress) {
      throw new Error(
        `Wrapped native is not defined in the networks package, please add.`
      )
    }
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

  // check from unlock directly
  if (!oracleAddress) {
    const unlock = await getUnlock(network.unlockAddress)
    oracleAddress = await unlock.uniswapOracles(tokenFrom.address)
    if (oracleAddress === ADDRESS_ZERO) {
      const {
        uniswapV3: { oracle: oracleAddressFromPackage },
      } = network
      if (!oracleAddress) {
        if (!oracleAddressFromPackage) {
          throw new Error(
            'No address for oracle in the networks package, please add one.'
          )
        }
        oracleAddress = oracleAddressFromPackage
      }
      throw new Error(
        `
        No oracle address for this token is set in Unlock.
        You can try with setOracle(${tokenFrom.address},<oracle address>)
        The oracle address in the networks package is: ${oracleAddressFromPackage}
        please check to see if values for the tokens can be fetched.
        `
      )
    }
  }

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
      )} ${tokenTo.symbol} for ${amount} ${tokenFrom.symbol}`
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
