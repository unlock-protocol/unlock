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

module.exports = async ([destChainId = 137, destAddress] = []) => {
  // parse call data for function call
  const { interface: unlockInterface } = await ethers.getContractAt(
    'Unlock',
    ADDRESS_ZERO
  )
  const protocolFee = ethers.utils.parseEther('0.000001')
  const calldata = unlockInterface.encodeFunctionData('setProtocolFee', [
    protocolFee,
  ])

  // src info
  const { chainId } = await ethers.provider.getNetwork()
  console.log(`From ${chainId} to ${destChainId}`)

  const {
    bridge: { connext: bridgeAddress },
  } = networks[chainId]

  // dest info
  const { multisig, bridge } = networks[destChainId]
  const { domainId: destDomainId } = bridge

  if (!destAddress) {
    destAddress = multisig
  }

  // proposed changes
  const calls = [
    {
      contractAddress: bridgeAddress,
      contractName: abiIConnext,
      functionName: 'xcall',
      functionArgs: [
        destDomainId,
        destAddress,
        ADDRESS_ZERO, // asset
        ADDRESS_ZERO, // delegate
        0, // amount
        30, // slippage
        calldata, // calldata
      ],
    },
  ]

  console.log(calls)

  // send to multisig / DAO
  return {
    proposalName: 'Bridge Proposal Test',
    calls,
  }
}
