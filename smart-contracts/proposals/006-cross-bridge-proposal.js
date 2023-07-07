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

module.exports = async ([
  destChainId = 137,
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

  const protocolFee = ethers.utils
    .parseEther(`0.000001`)
    .add(`${randInt(1, 999)}`)
  const calldata = unlockInterface.encodeFunctionData('setProtocolFee', [
    protocolFee,
  ])

  console.log(`setProtocolFee(${protocolFee})`)

  // src info
  const { chainId } = await ethers.provider.getNetwork()
  console.log(`From ${chainId} to ${destChainId}`)

  const {
    bridge: { connext: bridgeAddress },
  } = networks[chainId]

  // dest info
  const { bridge, unlockAddress } = networks[destChainId]
  if (!destAddress) {
    destAddress = unlockAddress
  }
  const { domainId: destDomainId, connextZodiacGnosisAddress } = bridge

  if (!destMultisigAddress) {
    destMultisigAddress = connextZodiacGnosisAddress
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

  // proposed changes
  const calls = [
    {
      contractAddress: bridgeAddress,
      contractName: abiIConnext,
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
    },
  ]

  console.log(calls)

  // send to multisig / DAO
  return {
    proposalName: `Bridge Proposal Test: ${destAddress}`,
    calls,
  }
}
