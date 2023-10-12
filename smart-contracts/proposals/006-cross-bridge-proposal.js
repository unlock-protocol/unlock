/**
 * Example of a bridged proposal that will be sent across Connext to multisigs
 * on the other side of the network.
 */
const { ADDRESS_ZERO } = require('../test/helpers')
const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')

const abiIConnext = [
  {
    inputs: [
      {
        internalType: 'uint32',
        name: '_destination',
        type: 'uint32',
      },
      {
        internalType: 'address',
        name: '_to',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_asset',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_delegate',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_slippage',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '_callData',
        type: 'bytes',
      },
    ],
    name: 'xcall',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
]

const targetChains = Object.keys(networks)
  .map((id) => networks[id])
  .filter(
    ({ governanceBridge, isTestNetwork }) =>
      !isTestNetwork && !!governanceBridge
  )

module.exports = async ([
  destChainId,
  destMultisigAddress,
  destAddress,
] = []) => {
  // parse call data for function call
  const { interface: unlockInterface } = await ethers.getContractAt(
    'Unlock',
    ADDRESS_ZERO
  )
  const randInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min

  const burnAddress = ADDRESS_ZERO
  const tokenAmount = ethers.utils
    .parseEther(`0.000001`)
    .add(`${randInt(1, 999)}`)

  const calldata = unlockInterface.encodeFunctionData('transferTokens', [
    ADDRESS_ZERO, // native tokens
    burnAddress, // to
    tokenAmount,
  ])

  console.log(`action: transferTokens(${tokenAmount})`)

  // src info
  const { chainId } = await ethers.provider.getNetwork()
  console.log(
    `from ${chainId} to chains ${targetChains.map(({ id }) => id).join(' - ')}`
  )

  const {
    governanceBridge: { connext: bridgeAddress },
  } = networks[chainId]

  // dest info
  const explainers = []
  const parsedCalls = await Promise.all(
    targetChains.map(async (network) => {
      const { governanceBridge, unlockAddress, name: destChainName } = network

      // make sure we have bridge infor in networks package
      if (!governanceBridge) return {}

      if (!destAddress) {
        destAddress = unlockAddress
      }

      const { domainId: destDomainId, connextZodiacModuleAddress } =
        governanceBridge

      if (!destMultisigAddress) {
        destMultisigAddress = connextZodiacModuleAddress
      }

      if (!destMultisigAddress || !destDomainId) {
        throw Error('Missing bridge information')
      }

      // encode data to be passed to Gnosis Zodiac module
      // following instructions at https://github.com/gnosis/zodiac-module-connext
      const moduleData = await ethers.utils.defaultAbiCoder.encode(
        ['address', 'uint256', 'bytes', 'bool'],
        [
          destAddress, // to
          0, // value
          calldata, // data
          0, // operation: 0 for CALL, 1 for DELEGATECALL
          // 0,
        ]
      )

      console.log(moduleData)

      // add small explanation
      explainers.push([destChainId, destChainName, unlockAddress])

      // proposed changes
      return {
        contractAddress: bridgeAddress,
        contractNameOrAbi: abiIConnext,
        functionName: 'xcall',
        functionArgs: [
          destDomainId,
          destMultisigAddress, // destMultisigAddress,
          ADDRESS_ZERO, // asset
          ADDRESS_ZERO, // delegate
          0, // amount
          30, // slippage
          moduleData, // calldata
        ],
      }
    })
  )

  // filter out empty calls
  const calls = parsedCalls.filter((call) => Object.keys(call).length !== 0)
  console.log(calls)

  const proposalName = `Testing the new cross-chain governance workflow

This DAO proposal aims at testing the new cross-chain governance process of Unlock Protocol's DAO. This new governance 
protocol allow proposals to propagate directly from the main DAO contract to protocol contracts on other chains.

# How it works

To reach another chain, all calls go though the [Connext bridge](https://www.connext.network/) and are 
executed on the other side of the bridge, after a period of cooldown.

The workflow is as follow

1. a DAO proposal is created, containing 1 call per chain
2. if the vote succeed, the DAO proposal is executed. All calls are send to the bridge
3. each call cross the bridge seperately towards its destination on a specific chain
4. the call is received on the destination chain by Unlock multisig
5. once received, the call is held in the multisig for a period of X days during which it can be cancelled.
6. once the cooldown period ends, the call is executed

NB: The cooldown period is useful to prevent malicious or errored calls from being executed 


# This proposal

The goal of this proposal is to test this new cross-chain workflow. Here, we are sending instructions
from this DAO to Unlock core contract on other chains. This is a common case used in protocol upgrades
or protocol settings change.

Here we don't do anything crazy, just a simple transfer of native tokens on each chain to the zero 
address. By burning a small amount of tokens we just aim at proving that the process is sound 
and actually works in practice.

# The calls

All calls are sent to Connext bridge at ${bridgeAddress} on chain ${chainId}:

${explainers
  .map(
    ([destChainId, destChainName, destAddress]) =>
      `- \`transferTokens(${tokenAmount})\` to ${destAddress} on chain ${destChainName} (${destChainId})`
  )
  .join('\n')}


Onwards !

The Unlock Protocol Team
`
  console.log(proposalName)
  // send to multisig / DAO
  return {
    proposalName,
    calls,
  }
}
