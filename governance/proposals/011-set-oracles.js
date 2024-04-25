/**
 * This proposal send calls accross the bridge to enable token distribution
 * on all supported networks.
 */
const { ADDRESS_ZERO, getNetwork } = require('@unlock-protocol/hardhat-helpers')
const { Unlock } = require('@unlock-protocol/contracts')
const { IConnext, targetChains } = require('../helpers/bridge')
const { parseSafeMulticall } = require('../helpers/multisig')
const getOracles = require('../scripts/uniswap/checkOracles')
const { ethers } = require('hardhat')

const parseSetOracleCalls = async (destChainId) => {
  const {
    unlockDaoToken: { address: udtAddress },
    name,
    tokens,
  } = await getNetwork(destChainId)

  // get Unlock interface
  const { interface: unlockInterface } = await ethers.getContractAt(
    Unlock.abi,
    ADDRESS_ZERO
  )

  // get oracles for all tokens in package + UDT
  const { oracleToSet, failed } = await getOracles({
    chainId: destChainId,
    quiet: true,
    tokens: [...tokens, { symbol: 'UDT', address: udtAddress, decimals: 18 }],
  })

  // TODO: what to do with failed ones?
  // parse unlock calls
  const calls = oracleToSet.map(({ token, oracleAddress }) =>
    unlockInterface.encodeFunctionData('setOracle', [
      token.address,
      oracleAddress,
    ])
  )

  const explainers = oracleToSet.map(
    ({ token, oracleAddress, fee }) =>
      `[${name} (${destChainId})] Oracle for ${token.symbol} (${token.address})
  - \`setOracle(${token.address},${oracleAddress})\` (fee: ${fee})`
  )

  return {
    calls,
    explainers,
  }
}

const parseBridgeCall = async ({ destChainId, calls }) => {
  const { governanceBridge, unlockAddress } = await getNetwork(destChainId)
  const calldata = await parseSafeMulticall({ chainId: destChainId, calls })

  // encode instructions to be executed by the SAFE
  const moduleData = await ethers.defaultAbiCoder.encode(
    ['address', 'uint256', 'bytes', 'bool'],
    [
      unlockAddress, // to
      0, // value
      calldata, // data
      1, // operation: 0 for CALL, 1 for DELEGATECALL
      // 0,
    ]
  )

  // get bridge info
  const {
    domainId: destDomainId,
    modules: { connextMod: destAddress },
    connext: bridgeAddress,
  } = governanceBridge

  if (!destDomainId || !destAddress) {
    throw Error('Missing bridge information')
  }

  // parse call for bridge
  return {
    contractAddress: bridgeAddress,
    contractNameOrAbi: IConnext,
    functionName: 'xcall',
    functionArgs: [
      destDomainId,
      destAddress, // destMultisigAddress,
      ADDRESS_ZERO, // asset
      ADDRESS_ZERO, // delegate
      0, // amount
      30, // slippage
      moduleData, // calldata
    ],
  }
}

module.exports = async () => {
  // list networks that are supported by Connext and have UDT bridged
  const destChains = [
    ...targetChains.filter(
      ({ unlockDaoToken, uniswapV3 }) =>
        unlockDaoToken && uniswapV3 && uniswapV3.oracle
    ),
    await getNetwork(1), // add mainnet
  ]

  // get oracle for all tokens in Unlock on dest chains
  const setOracleCalls = []
  for (let i in [...destChains]) {
    const { name, id } = destChains[i]
    console.log(`Parsing for chain ${name} (${id})`)
    const calls = await parseSetOracleCalls(id)
    setOracleCalls.push(calls)
  }

  console.log(setOracleCalls)

  const explainers = setOracleCalls.map(
    ({ explainers }, i) =>
      `### ${destChains[i].name} (${destChains[i].id}) ${
        explainers.length
      } calls

  ${explainers.join(`\n`)}
      `
  )

  console.log(explainers)
  // TODO: parse bridge calls

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

The same oracle contract can be used for any pairs, with the limitation that there needs to be an existing / active Uniswap pool for that pair. Three different contracts are used to query the rate for the three tiers of [Uniswap pool fees](https://docs.uniswap.org/concepts/protocol/fees) (100, 500 and 3000 bps).

For each token, the working oracle is selected and added to the Unlock contract 
using the \`setOracle\` function.

## How it works

The proposal uses a cross-chain proposal pattern that, once passed, will send the calls to multiple chains at once. This pattern has been introduced and tested in a [previous proposal](https://www.tally.xyz/gov/unlock/proposal/1926572528290918174819693611122933562560576845671089759587616947457423587439). 

Here, the calls for each chain have been packed with Gnosis Multicall contract to be executed at once on the destination chain.

## The calls

This DAO proposal contains ${explainers.length} calls:

${explainers.join('\n\n')}


Onwards !

The Unlock Protocol Team
`
  console.log(proposalName)

  // send to multisig / DAO
  return {
    proposalName,
    calls: setOracleCalls,
  }
}
