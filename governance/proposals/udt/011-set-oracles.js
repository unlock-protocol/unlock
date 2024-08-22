/**
 * This proposal send calls accross the bridge to enable token distribution
 * on all supported networks.
 */
const { ADDRESS_ZERO, getNetwork } = require('@unlock-protocol/hardhat-helpers')
const { Unlock } = require('@unlock-protocol/contracts')
const { targetChains } = require('../../helpers/bridge')
const { parseSafeMulticall } = require('../../helpers/multisig')
const getOracles = require('../../scripts/uniswap/checkOracles')
const { ethers } = require('hardhat')
const { parseBridgeCall } = require('../../helpers/crossChain')

const parseSetOracleCalls = async (destChainId) => {
  const {
    unlockDaoToken: { address: udtAddress },
    tokens: packageTokens,
    unlockAddress,
  } = await getNetwork(destChainId)

  // get Unlock interface
  const { interface: unlockInterface } = await ethers.getContractAt(
    Unlock.abi,
    ADDRESS_ZERO
  )

  // get oracles for all tokens in package + UDT
  const tokens = [
    ...packageTokens,
    {
      symbol: 'UDT',
      name: 'Unlock Discount Token',
      address: udtAddress,
      decimals: 18,
    },
  ]

  // fetch oracles for all tokens
  const { oracleToSet, failed } = await getOracles({
    chainId: destChainId,
    quiet: false,
    tokens,
  })

  // parse unlock calls
  const calls = oracleToSet.map(({ token, oracleAddress }) => ({
    contractAddress: unlockAddress,
    calldata: unlockInterface.encodeFunctionData('setOracle', [
      token.address,
      oracleAddress,
    ]),
    value: 0,
    operation: 1, // Unlock is a proxy so use DELEGATECALL
  }))

  const explainers = oracleToSet.map(
    ({ token, oracleAddress, fee }) =>
      `- Oracle for ${token.symbol} (${token.address})
  \`setOracle(${token.address},${oracleAddress})\` (fee: ${fee})`
  )

  return {
    calls,
    failed, // TODO: waht to do with failed
    explainers,
  }
}

const parseSafeCall = async ({ destChainId, calls }) => {
  // parse multicall
  const { to, data, value, operation } = await parseSafeMulticall({
    chainId: destChainId,
    calls,
  })

  // encode multicall instructions to be executed by the SAFE
  const abiCoder = ethers.AbiCoder.defaultAbiCoder()
  const moduleData = abiCoder.encode(
    ['address', 'uint256', 'bytes', 'bool'],
    [
      to, // to
      value, // value
      data, // data
      operation, // operation: 0 for CALL, 1 for DELEGATECALL
    ]
  )
  return moduleData
}

module.exports = async () => {
  // list networks that are supported by Connext and have UDT bridged
  const destChains = targetChains.filter(
    ({ unlockDaoToken, uniswapV3 }) =>
      unlockDaoToken && uniswapV3 && uniswapV3.oracle
  )

  const explainers = []

  // get oracle calls for mainnet
  console.log(`Parsing for Ethereum Mainnet (1)`)
  const { calls: mainnetCalls, explainers: mainnetExplainers } =
    await parseSetOracleCalls(1)

  explainers.push({
    name: 'Ethereum Mainnet',
    id: 1,
    explainers: mainnetExplainers,
  })

  // get oracle for all tokens in Unlock on dest chains
  const bridgedCalls = []
  for (let i in [...destChains]) {
    const { name, id } = destChains[i]
    console.log(`Parsing for chain ${name} (${id})`)
    const { calls, explainers: destExplainers } = await parseSetOracleCalls(id)
    const moduleData = await parseSafeCall({ destChainId: id, calls })
    const bridgedCall = await parseBridgeCall({ destChainId: id, moduleData })
    bridgedCalls.push(bridgedCall)
    explainers.push({
      name,
      id,
      explainers: destExplainers,
    })
  }

  const calls = [...mainnetCalls, ...bridgedCalls]
  console.log(explainers)
  // parse proposal
  const title = `Set Uniswap oracles for UDT and most used ERC20 tokens`

  const proposalName = `${title}

## Goal of the proposal

This proposal sets Uniswap oracle in Unlock factory contracts across the following chains: ${destChains
    .map(({ name }) => name)
    .toString()}. 
  
The goal is twofold: 1) enable the distribution of UDT for referrers when buying keys and 2) better calculation of the Gross Network Product (GNP) by taking into accounts the most commonly used tokens.

## About this proposal

On each chain, wrappers for Uniswap oracle contracts have been deployed. An oracle is used to guess the current exchange rate of a specific token pair (for instance ETH/USDC).

The same oracle contract can be used for any pairs, with the limitation that there needs to be an existing / active Uniswap pool for that pair. Three different contracts are used to query the rate for the three tiers of [Uniswap pool fees](https://docs.uniswap.org/concepts/protocol/fees). Fee amounts are hundredths of the basis point so 100 fee unit is 0.01%, 500 is 0.05%, and 3000 is 0.3%.

For each token, the working oracle is selected and added to the Unlock contract 
using the \`setOracle\` function.

## How it works

The proposal uses a cross-chain proposal pattern that, once passed, will send the calls to multiple chains at once. This pattern has been introduced and tested in a [previous proposal](https://www.tally.xyz/gov/unlock/proposal/1926572528290918174819693611122933562560576845671089759587616947457423587439). 

Here, the calls for each chain have been packed with Gnosis Multicall contract to be executed at once on the destination chain.

## The calls

This DAO proposal contains ${calls.length} calls:

${explainers
  .map(
    ({ name, id, explainers: exp }) => `### ${name} (${id}) ${
      exp.length
    } calls ${id !== 1 ? `(packed in a single multicall)` : ''}

${exp.join(`\n`)}
  `
  )
  .join('\n\n')}


Onwards !

The Unlock Protocol Team
`
  console.log(proposalName)
  console.log(calls)

  // send to multisig / DAO
  return {
    proposalName,
    calls,
  }
}
