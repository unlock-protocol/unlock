/**
 * This proposal send calls accross the bridge to enable protocol fees
 * on all supported networks.
 */
const { ADDRESS_ZERO, getNetwork } = require('@unlock-protocol/hardhat-helpers')
const { Unlock } = require('@unlock-protocol/contracts')
const { IConnext, targetChains } = require('../helpers/bridge')
const { parseSafeMulticall } = require('../helpers/multisig')
const { ethers } = require('hardhat')
const PROTOCOL_FEE_STRING = '0.0001'

const parseSetProtocolFeeCalls = async (destChainId) => {
  const { unlockAddress } = await getNetwork(destChainId)

  const protocolFee = ethers.parseEther(PROTOCOL_FEE_STRING)

  console.log(`Proposol to set protocolFee to ${ethers.formatEther(protocolFee)}
    - unlock : ${unlockAddress}`)

  // get Unlock interface
  const { interface: unlockInterface } = await ethers.getContractAt(
    Unlock.abi,
    unlockAddress
  )

  // parse unlock calls
  const calls = [
    {
      contractAddress: unlockAddress,
      calldata: unlockInterface.encodeFunctionData('setProtocolFee', [
        protocolFee,
      ]),
      value: 0,
      operation: 1, // Unlock is a proxy so use DELEGATECALL
    },
  ]

  const oldProtocolFee = await unlockInterface.protocolFee()
  const explainers = [
    `- Protocol fee for ${unlockAddress} set to ${PROTOCOL_FEE_STRING}
  \`setProtocolFee(${protocolFee})\` (Previous Protocol Fee: ${ethers.formatEther(
    oldProtocolFee
  )})`,
  ]

  return {
    calls,
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

const parseBridgeCall = async ({ destChainId, moduleData }) => {
  const { governanceBridge } = await getNetwork(destChainId)

  // get bridge info on receiving chain
  const {
    domainId: destDomainId,
    modules: { connextMod: destAddress },
  } = governanceBridge

  // get bridge address on mainnet
  const {
    governanceBridge: { connext: bridgeAddress },
  } = await getNetwork(1)

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
  const explainers = []

  // get oracle calls for mainnet
  console.log(`Parsing for Ethereum Mainnet (1)`)
  const { calls: mainnetCalls, explainers: mainnetExplainers } =
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
    const { calls, explainers: destExplainers } =
      await parseSetProtocolFeeCalls(id)
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
  const title = `Set Protocol Fee for Unlock Protocol`

  const proposalName = `${title}

## Goal of the proposal

This proposal sets the protocol fee in Unlock factory contracts across the following chains: ${targetChains
    .map(({ name }) => name)
    .toString()}. 
  
The goal is to turn on the protocol's fee switch and set it to ${PROTOCOL_FEE_STRING}.

## About this proposal

On each chain, the protocol fee for the Unlock contract is set to the specified amount 
using the \`setProtocolFee\` function.

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
