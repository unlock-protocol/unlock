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
  fee = 500,
  quiet = false,
} = {}) {
  const network = await getNetwork()
  const {
    nativeCurrency: { wrapped: wrappedNativeAddress },
    tokens,
  } = network

  const log = (toLog) => (quiet ? null : console.log(toLog))

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
      console.log(`No oracle address for this token is set in Unlock.`)

      // get the correct oracle for appropriate fee
      const {
        uniswapV3: { oracle },
      } = network
      const oracleAddressFromPackage = oracle[fee]
      if (!oracleAddressFromPackage) {
        throw new Error(
          `No address for oracle with fee ${fee} in the networks package, please add one.`
        )
      }
      oracleAddress = oracleAddressFromPackage
    }
  }

  // check if token can be retrieved through Uniswap V3 oracle
  const oracle = await ethers.getContractAt(UniswapOracleV3.abi, oracleAddress)
  log(`Checking oracle for ${tokenFrom.symbol}/${tokenTo.symbol} (${amount})`)
  const rate = await oracle.consult(
    tokenFrom.address,
    ethers.parseUnits(amount, tokenFrom.decimals),
    tokenTo.address
  )
  if (rate === 0n) {
    log(`Uniswap V3 pool not found`)
  } else {
    log(
      `Current rate (~last hour) : ${ethers.formatUnits(
        rate,
        tokenTo.decimals
      )} ${tokenTo.symbol} for ${amount} ${tokenFrom.symbol}`
    )
  }
  return rate
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
