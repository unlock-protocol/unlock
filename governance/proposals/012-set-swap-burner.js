/**
 * This proposal send calls accross the bridge to set swap burner
 * in Unlock on Arbitrum, Base, and Optimism.
 */
const { ADDRESS_ZERO, getNetwork } = require('@unlock-protocol/hardhat-helpers')
const { Unlock } = require('@unlock-protocol/contracts')
const { IConnext } = require('../helpers/bridge')
const { ethers } = require('hardhat')

const targetChainsIds = [
  42161, // Arbitrum
  8453, // Base
  10, // Optimism
]

// TODO: deploy swap burner contracts
const swapBurnerAddresses = {
  42161: ADDRESS_ZERO, // Arbitrum
  8453: ADDRESS_ZERO, // Base
  10: ADDRESS_ZERO, // Optimism
}

const parseCall = async (destChainId) => {
  const { unlockAddress } = await getNetwork(destChainId)
  const swapBurnerAddress = swapBurnerAddresses[destChainId]

  // get Unlock interface
  const { interface: unlockInterface } = await ethers.getContractAt(
    Unlock.abi,
    unlockAddress
  )

  // parse unlock call
  const to = unlockAddress
  const value = 0
  const operation = 1
  const data = unlockInterface.encodeFunctionData('setSwapBurner', [
    swapBurnerAddress,
  ])

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

  const explainer = `Proposol to set swapBurner to ${swapBurnerAddress}
  - unlock : ${unlockAddress}`

  return { moduleData, explainer }
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
  const targetChains = await Promise.all(
    targetChainsIds.map((id) => getNetwork(id))
  )

  // get setProtocolFee call data for dest chains
  const calls = []
  for (let i in targetChains) {
    const { name, id: chainId } = targetChains[i]
    console.log(`Parsing for chain ${name} (${chainId})`)
    const { moduleData, explainer } = await parseCall(chainId)
    const bridgedCall = await parseBridgeCall({
      destChainId: chainId,
      moduleData,
    })
    calls.push(bridgedCall)
    explainers.push({
      name,
      id: chainId,
      explainer: explainer,
    })
  }

  console.log({ explainers, calls })

  // parse proposal
  const title = `Set Swap Burner on Arbitrum, Base and Optimism`

  const proposalName = `${title}

## Goal of the proposal

This proposal sets the Swap Burner contract in Unlock factory contracts across the following chains: ${targetChains
    .map(({ name }) => name)
    .toString()}. 
  
## About this proposal

A \`SwapBurner\` helper contract has been deployed on all three chains and will be added as setting to the main Unlock contract. This will enable the “swap and burn” feature of fees collected by the protocol on these chains, following the deployment of bridged versions of UDT there.

## How it works

The proposal uses a cross-chain proposal pattern that, once passed, will send the calls to multiple chains at once. This pattern has been introduced and tested in a [previous proposal](https://www.tally.xyz/gov/unlock/proposal/1926572528290918174819693611122933562560576845671089759587616947457423587439). 

## The calls

This DAO proposal contains ${calls.length} calls:

${explainers
  .map(
    ({ name, id, explainer: exp }) => `### ${name} (${id}) 1 call

  ${exp}
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
