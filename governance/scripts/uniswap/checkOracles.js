const { ethers } = require('hardhat')
const checkOracle = require('./oracle')
const {
  getNetwork,
  getUnlock,
  ADDRESS_ZERO,
} = require('@unlock-protocol/hardhat-helpers')

// helper to check rate
const checkOracleRate = async ({ oracleAddress, token }) => {
  const returned = {
    oracleAddress,
    token,
  }
  try {
    const rate = await checkOracle({
      tokenIn: token.symbol,
      quiet: true,
      oracleAddress,
    })

    if (rate === 0n) {
      return {
        ...returned,
        success: false,
        msg: `Missing Uniswap Pool - oracle: ${oracleAddress}`,
      }
    } else {
      return {
        ...returned,
        success: true,
        rate,
      }
    }
  } catch (error) {
    return {
      ...returned,
      success: false,
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

  let checks = []

  if (uniswapV3 && uniswapV3.oracle) {
    for (let i in tokens) {
      const token = tokens[i]
      // avoid WETH/WETH pair
      if (token.address !== wrapped) {
        // check if oracle is set in Unlock
        const unlock = await getUnlock(unlockAddress)
        const oracleAddress = await unlock.uniswapOracles(token.address)

        // if not set, check if uniswap oracle in networks package works
        if (oracleAddress === ADDRESS_ZERO) {
          const rates = await Promise.all(
            Object.keys(uniswapV3.oracle).map((fee, i) => {
              checkOracleRate({
                oracleAddress: uniswapV3.oracle[fee],
                fee,
                token,
              })
            })
          )
          checks = [...checks, ...rates]
        } else {
          // if oracle is set in Unlock, make sure it works
          const unlockRate = await checkOracleRate({
            oracleAddress,
            token,
          })
          checks = [...checks, unlockRate]
        }
      }
    }
  }
  // log errors only
  checks
    .filter(({ success }) => !success)
    .forEach(({ msg, token, fee, oracleAddress }) =>
      console.log(
        `[${name} (${id})]: ${token.symbol} 
        - setOracle(${token.address},${oracleAddress}) (${fee})
        - ${msg}`
      )
    )
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
