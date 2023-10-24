/**
 *
 */

const { networks } = require('@unlock-protocol/networks')
const { ethers } = require('hardhat')

const delayModAbi = [
  {
    inputs: [
      { internalType: 'address', name: '_owner', type: 'address' },
      { internalType: 'address', name: '_avatar', type: 'address' },
      { internalType: 'address', name: '_target', type: 'address' },
      { internalType: 'uint256', name: '_cooldown', type: 'uint256' },
      { internalType: 'uint256', name: '_expiration', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousAvatar',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newAvatar',
        type: 'address',
      },
    ],
    name: 'AvatarSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'guard',
        type: 'address',
      },
    ],
    name: 'ChangedGuard',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'initiator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'avatar',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
    ],
    name: 'DelaySetup',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'module',
        type: 'address',
      },
    ],
    name: 'DisabledModule',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'module',
        type: 'address',
      },
    ],
    name: 'EnabledModule',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousTarget',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newTarget',
        type: 'address',
      },
    ],
    name: 'TargetSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'queueNonce',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'txHash',
        type: 'bytes32',
      },
      { indexed: false, internalType: 'address', name: 'to', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      { indexed: false, internalType: 'bytes', name: 'data', type: 'bytes' },
      {
        indexed: false,
        internalType: 'enum Enum.Operation',
        name: 'operation',
        type: 'uint8',
      },
    ],
    name: 'TransactionAdded',
    type: 'event',
  },
  {
    inputs: [],
    name: 'avatar',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'prevModule', type: 'address' },
      { internalType: 'address', name: 'module', type: 'address' },
    ],
    name: 'disableModule',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'module', type: 'address' }],
    name: 'enableModule',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
      { internalType: 'enum Enum.Operation', name: 'operation', type: 'uint8' },
    ],
    name: 'execTransactionFromModule',
    outputs: [{ internalType: 'bool', name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
      { internalType: 'enum Enum.Operation', name: 'operation', type: 'uint8' },
    ],
    name: 'execTransactionFromModuleReturnData',
    outputs: [
      { internalType: 'bool', name: 'success', type: 'bool' },
      { internalType: 'bytes', name: 'returnData', type: 'bytes' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
      { internalType: 'enum Enum.Operation', name: 'operation', type: 'uint8' },
    ],
    name: 'executeNextTx',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getGuard',
    outputs: [{ internalType: 'address', name: '_guard', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'start', type: 'address' },
      { internalType: 'uint256', name: 'pageSize', type: 'uint256' },
    ],
    name: 'getModulesPaginated',
    outputs: [
      { internalType: 'address[]', name: 'array', type: 'address[]' },
      { internalType: 'address', name: 'next', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
      { internalType: 'enum Enum.Operation', name: 'operation', type: 'uint8' },
    ],
    name: 'getTransactionHash',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_nonce', type: 'uint256' }],
    name: 'getTxCreatedAt',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_nonce', type: 'uint256' }],
    name: 'getTxHash',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'guard',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_module', type: 'address' }],
    name: 'isModuleEnabled',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'queueNonce',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_avatar', type: 'address' }],
    name: 'setAvatar',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_guard', type: 'address' }],
    name: 'setGuard',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_target', type: 'address' }],
    name: 'setTarget',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'cooldown', type: 'uint256' }],
    name: 'setTxCooldown',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'expiration', type: 'uint256' }],
    name: 'setTxExpiration',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_nonce', type: 'uint256' }],
    name: 'setTxNonce',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: 'initParams', type: 'bytes' }],
    name: 'setUp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'skipExpired',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'target',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'txCooldown',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'txCreatedAt',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'txExpiration',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'txHash',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'txNonce',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
]

const connextModAbi = [
  {
    inputs: [
      { internalType: 'address', name: '_owner', type: 'address' },
      { internalType: 'address', name: '_avatar', type: 'address' },
      { internalType: 'address', name: '_target', type: 'address' },
      { internalType: 'address', name: '_originSender', type: 'address' },
      { internalType: 'uint32', name: '_origin', type: 'uint32' },
      { internalType: 'address', name: '_connext', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'ConnextOnly', type: 'error' },
  { inputs: [], name: 'ModuleTransactionFailed', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'guard_', type: 'address' }],
    name: 'NotIERC165Compliant',
    type: 'error',
  },
  { inputs: [], name: 'OriginOnly', type: 'error' },
  { inputs: [], name: 'OriginSenderOnly', type: 'error' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousAvatar',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newAvatar',
        type: 'address',
      },
    ],
    name: 'AvatarSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'guard',
        type: 'address',
      },
    ],
    name: 'ChangedGuard',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'connext',
        type: 'address',
      },
    ],
    name: 'ConnextSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint8', name: 'version', type: 'uint8' },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'avatar',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'originSender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'origin',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'connext',
        type: 'address',
      },
    ],
    name: 'ModuleSetUp',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'originSender',
        type: 'address',
      },
    ],
    name: 'OriginSenderSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint32',
        name: 'origin',
        type: 'uint32',
      },
    ],
    name: 'OriginSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousTarget',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newTarget',
        type: 'address',
      },
    ],
    name: 'TargetSet',
    type: 'event',
  },
  {
    inputs: [],
    name: 'avatar',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'connext',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getGuard',
    outputs: [{ internalType: 'address', name: '_guard', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'guard',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'origin',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'originSender',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_avatar', type: 'address' }],
    name: 'setAvatar',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_connext', type: 'address' }],
    name: 'setConnext',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_guard', type: 'address' }],
    name: 'setGuard',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint32', name: '_origin', type: 'uint32' }],
    name: 'setOrigin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_originSender', type: 'address' },
    ],
    name: 'setOriginSender',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_target', type: 'address' }],
    name: 'setTarget',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes', name: 'initializeParams', type: 'bytes' },
    ],
    name: 'setUp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'target',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '', type: 'bytes32' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'address', name: '_asset', type: 'address' },
      { internalType: 'address', name: '_originSender', type: 'address' },
      { internalType: 'uint32', name: '_origin', type: 'uint32' },
      { internalType: 'bytes', name: '_callData', type: 'bytes' },
    ],
    name: 'xReceive',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  console.log(`Sending on ${chainId}`)
  const { bridge, multisig } = networks[chainId]
  if (
    !bridge ||
    !bridge.modules ||
    !bridge.modules.delayMod ||
    !bridge.modules.connextMod
  ) {
    throw Error('Missing bridge SAFE modules.')
  }

  console.log(bridge.modules)
  // parse contracts
  const delayMod = await ethers.getContractAt(
    delayModAbi,
    bridge.modules.delayMod
  )
  const connextMod = await ethers.getContractAt(
    connextModAbi,
    bridge.modules.connextMod
  )

  // make sure config is correct
  if (
    (await delayMod.target()) != multisig ||
    (await connextMod.target()) != delayMod.address
  ) {
    throw Error('Config error in SAFE modules.')
  }

  // enable Connext as a sub-module of Delay
  if (!(await delayMod.isModuleEnabled(connextMod.address))) {
    const tx = await delayMod.enableModule(connextMod.address)
    console.log(tx)
  }

  // make sure ownership of the modules has been transferred to the safe
  if ((await delayMod.owner()) != multisig) {
    console.log('Transferring ownership of Delay module to SAFE.')
    await delayMod.transferOwnership(multisig)
  }

  if ((await connextMod.owner()) != multisig) {
    console.log('Transferring ownership of Connext module to SAFE.')
    await connextMod.transferOwnership(multisig)
  }

  // parse call to enable the Delay module on multisig
  // NB: we use the delayMod `enableModule` ABI as it is identical to the one in SAFE
  const functionName = 'enableModule'
  const functionArgs = [delayMod.address]
  const calldata = delayMod.interface.encodeFunctionData(
    functionName,
    functionArgs
  )

  const calls = [
    {
      functionName,
      functionArgs,
      contractAddress: multisig,
      calldata,
    },
  ]

  // return actual call
  const proposalArgs = {
    calls,
    proposalName: 'Enable Delay and Connext modules on multisig',
  }

  return proposalArgs
}

module.exports = main
