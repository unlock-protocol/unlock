/**
 * This script is used to check if oracles are set correctly in Unlock
 * and if fetch which one to set from the networks package
 *
 * Usage
 *  yarn hardhat run scripts/uniswap/checkOracles.js --network arbitrum
 *
 */
const { ethers } = require('hardhat')
const checkOracle = require('./oracle')
const { Contract } = require('ethers')
const { getProvider } = require('../../helpers/multisig')
const { getNetwork, ADDRESS_ZERO } = require('@unlock-protocol/hardhat-helpers')

// helper to check rate
const checkOracleRate = async ({
  chainId,
  oracleAddress,
  token,
  fee = 500,
  issue,
}) => {
  const returned = {
    oracleAddress,
    token,
    fee,
    issue,
  }
  try {
    const rate = await checkOracle({
      tokenIn: token.symbol,
      amount: '10',
      quiet: true,
      oracleAddress,
      chainId,
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

async function main({ chainId, quiet = false, tokens } = {}) {
  if (!chainId) {
    ;({ chainId } = await ethers.provider.getNetwork())
  }
  const {
    name,
    id,
    uniswapV3,
    unlockAddress,
    tokens: packageTokens,
    nativeCurrency: { wrapped },
  } = await getNetwork(chainId)

  if (!tokens) {
    tokens = packageTokens
  }

  const provider = await getProvider(chainId)
  let oracleToSet = []
  let failed = []
  if (uniswapV3 && uniswapV3.oracle) {
    for (let i in tokens) {
      const token = tokens[i]
      // avoid WETH/WETH pair
      if (token.address !== wrapped) {
        // check if oracle is set in Unlock
        const unlock = new Contract(
          unlockAddress,
          ['function uniswapOracles(address) external view returns(address)'],
          provider
        )
        const oracleAddressInUnlock = await unlock.uniswapOracles(token.address)

        let oracleNeedToBeSet = false
        // if oracle is set in Unlock, make sure it works
        if (oracleAddressInUnlock !== ADDRESS_ZERO) {
          const { success } = await checkOracleRate({
            chainId,
            oracleAddress: oracleAddressInUnlock,
            token,
            issue: 'Oracle in Unlock is failing',
          })
          if (!success) {
            oracleNeedToBeSet = true
          }
        } else {
          oracleNeedToBeSet = true
        }

        // if oracle not set or not working, fetch a working one
        if (oracleNeedToBeSet) {
          const rates = await Promise.all(
            Object.keys(uniswapV3.oracle).map((fee) =>
              checkOracleRate({
                oracleAddress: uniswapV3.oracle[fee],
                fee,
                token,
                chainId,
                issue: 'Oracle was not set in Unlock',
              })
            )
          )
          const workingOracle = rates.find(({ success }) => success)
          if (workingOracle) {
            oracleToSet.push(workingOracle)
          } else {
            const { token } = rates.find(({ fee }) => fee === '500')
            failed = [
              ...failed,
              `No working oracle for ${token.symbol} ${
                token.address
              } with pool fees : ${rates.map(({ fee }) => fee).join()}`,
            ]
          }
        }
      }
    }
  }

  // log results
  if (!quiet) {
    oracleToSet.forEach(({ token, fee, oracleAddress, issue }) =>
      console.log(
        `[${name} (${id})]: oracle for ${token.symbol} (${token.address})
          - \`setOracle(${token.address},${oracleAddress})\` (${fee})
          - reason: ${issue}`
      )
    )
    failed.forEach((msg) => console.log(`[${name} (${id})] FAILED ${msg}`))
  }

  return {
    oracleToSet,
    failed,
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
