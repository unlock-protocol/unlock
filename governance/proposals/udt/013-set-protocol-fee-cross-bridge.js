/**
 * This proposal send calls accross the bridge to enable protocol fees
 * on all supported networks.
 */
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const { Unlock } = require('@unlock-protocol/contracts')
const { targetChains } = require('../../helpers/bridge')
const { ethers } = require('hardhat')
const { parseBridgeCall } = require('../../helpers/crossChain')
const PROTOCOL_FEE_IN_BASIS_POINTS = '100' // 1% in basis points

const parseSetProtocolFeeCalls = async (destChainId) => {
  const { unlockAddress } = await getNetwork(destChainId)

  console.log(
    `Proposol to set protocolFee to ${PROTOCOL_FEE_IN_BASIS_POINTS} basis points`
  )

  // get Unlock interface
  const unlockInterface = new ethers.Interface(Unlock.abi)

  const calldata = unlockInterface.encodeFunctionData('setProtocolFee', [
    PROTOCOL_FEE_IN_BASIS_POINTS,
  ])

  // encode instructions to be executed by the SAFE
  const abiCoder = ethers.AbiCoder.defaultAbiCoder()
  const moduleData = await abiCoder.encode(
    ['address', 'uint256', 'bytes', 'bool'],
    [
      unlockAddress, // to
      0, // value
      calldata, // data
      0, // operation: 0 for CALL, 1 for DELEGATECALL
    ]
  )

  const calls = [
    {
      contractAddress: unlockAddress,
      calldata,
      value: 0,
      operation: 0,
    },
  ]
  const explainers = [
    `- Protocol fee for ${unlockAddress} set to ${PROTOCOL_FEE_IN_BASIS_POINTS}
  \`setProtocolFee(${PROTOCOL_FEE_IN_BASIS_POINTS})\`
  `,
  ]

  return {
    calls,
    explainers,
    moduleData,
  }
}

module.exports = async () => {
  const explainers = []

  // get protocol fee call for mainnet
  console.log(`Parsing for Ethereum Mainnet (1)`)
  const { calls: mainnetCall, explainers: mainnetExplainers } =
    await parseSetProtocolFeeCalls(1)

  explainers.push({
    name: 'Ethereum Mainnet',
    id: 1,
    explainers: mainnetExplainers,
  })

  // get setProtocolFee call data for dest chains
  const bridgedCalls = []
  for (let i in [...targetChains]) {
    const { name, id } = targetChains[i]
    console.log(`Parsing for chain ${name} (${id})`)
    const { explainers: destExplainers, moduleData } =
      await parseSetProtocolFeeCalls(id)
    const bridgedCall = await parseBridgeCall({ destChainId: id, moduleData })
    bridgedCalls.push(bridgedCall)
    explainers.push({
      name,
      id,
      explainers: destExplainers,
    })
  }

  const calls = [...mainnetCall, ...bridgedCalls]
  console.log(explainers)
  // parse proposal
  const title = `Set Protocol Fee for Unlock Protocol`

  const proposalName = `${title}

## Goal of the proposal

This proposal sets the protocol fee in Unlock factory contracts across the following chains: ${targetChains
    .map(({ name }) => name)
    .toString()}. 
  
The goal is to turn on the protocol's fee switch and set it to 1% (${PROTOCOL_FEE_IN_BASIS_POINTS} basis points) as [voted by the Unlock DAO on Snapshot](https://snapshot.org/#/unlock-protocol.eth/proposal/0xfb31abbb3ff6c8ef60bc3db9cd47adab0158ce1f955709f75cc2022b075dac8b).

## About this proposal

On each chain, the protocol fee for the Unlock contract is set to the specified amount 
using the \`setProtocolFee\` function.

## How it works

The proposal uses a cross-chain proposal pattern that, once passed, will send the calls to multiple chains at once. This pattern has been introduced and tested in a [previous proposal](https://www.tally.xyz/gov/unlock/proposal/1926572528290918174819693611122933562560576845671089759587616947457423587439). 

## The calls

This DAO proposal contains ${calls.length} calls:

${explainers
  .map(
    ({ name, id, explainers: exp }) => `### ${name} (${id}) ${exp.length} calls
${exp.join(`\n`)}
  `
  )
  .join('\n\n')}

LFG 🚀🚀🚀
`
  console.log(proposalName)
  console.log(calls)

  // send to multisig / DAO
  return {
    proposalName,
    calls,
  }
}
