const { ethers } = require('hardhat')
const { Contract } = require('ethers')
const { getProvider } = require('../../helpers/multisig')

const { getNetwork, ADDRESS_ZERO } = require('@unlock-protocol/hardhat-helpers')
const { UniswapOracleV3 } = require('@unlock-protocol/contracts')

async function main({
  tokenIn = 'UDT',
  tokenOut,
  amount = '1',
  oracleAddress,
  fee = 500,
  quiet = false,
  chainId,
} = {}) {
  if (!chainId) {
    ;({ chainId } = await ethers.provider.getNetwork())
  }
  const network = await getNetwork(chainId)
  const provider = await getProvider(chainId)

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
    const wrapped = new Contract(
      wrappedNativeAddress,
      ['function symbol() external view returns (string memory)'],
      provider
    )
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

  // check from unlock directly
  if (!oracleAddress) {
    const unlock = new Contract(
      network.unlockAddress,
      ['function uniswapOracles(address) external view returns(address)'],
      provider
    )
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
  const oracle = new Contract(oracleAddress, UniswapOracleV3.abi, provider)
  log(
    `Checking oracle for ${tokenFrom.symbol}/${tokenTo.symbol} (${amount} ${tokenFrom.symbol})`
  )
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
