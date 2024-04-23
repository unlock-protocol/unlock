const { ethers } = require('hardhat')
const checkOracle = require('./oracle')
const {
  getNetwork,
  getUnlock,
  ADDRESS_ZERO,
} = require('@unlock-protocol/hardhat-helpers')

const logError = (name, chainId, token, msg) =>
  console.log(
    `[${name} (${chainId})]: ${msg} ${token.symbol} (${token.address})`
  )

// helper to check rate
const checkOracleRate = async ({ oracleAddress, token }) => {
  try {
    const rate = await checkOracle({
      tokenIn: token.symbol,
      quiet: true,
      oracleAddress,
    })
    if (rate === 0n) {
      return {
        token,
        msg: `Missing Uniswap Pool - oracle: ${oracleAddress}`,
      }
    }
  } catch (error) {
    return {
      token,
      msg: `Failed to fetch rate:  ${error.message} - oracle: ${oracleAddress}`,
    }
  }
}

async function main() {
  const {
    name,
    id,
    uniswapV3,
    unlockAddress,
    tokens,
    nativeCurrency: { wrapped },
  } = await getNetwork()

  const oracleErrors = []
  const missingOracles = []

  if (uniswapV3 && uniswapV3.oracle) {
    for (let i in tokens) {
      const token = tokens[i]

      // check if oracle is set in Unlock
      const unlock = await getUnlock(unlockAddress)
      const oracleAddress = await unlock.uniswapOracles(token.address)
      if (oracleAddress === ADDRESS_ZERO) {
        missingOracles.push({ token })
      } else {
        // if oracle is set in Unlock, make sure it works
        const error = await checkOracleRate({ oracleAddress, token })
        if (error)
          oracleErrors.push({
            ...error,
            msg: `(already in Unlock) ${error.msg}`,
          })
      }

      // check if uniswap oracle in networks package works
      const error = await checkOracleRate({
        oracleAddress: uniswapV3.oracle,
        token,
      })
      if (error) oracleErrors.push(error)
    }
    // log all errors
    oracleErrors.forEach(({ msg, token }) => logError(name, id, token, msg))
    missingOracles.forEach(({ token }) =>
      logError(name, id, token, `Oracle not set in Unlock for:`)
    )
  }

  //
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
