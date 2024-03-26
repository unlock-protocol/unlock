const { ethers } = require('hardhat')
const { ADDRESS_ZERO, getNetwork } = require('@unlock-protocol/hardhat-helpers')
const { networks } = require('@unlock-protocol/networks')

/***
 * CONNEXT logic
 */
const xCalledABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'transferId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'messageHash',
        type: 'bytes32',
      },
      {
        components: [
          {
            internalType: 'uint32',
            name: 'originDomain',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'destinationDomain',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'canonicalDomain',
            type: 'uint32',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'delegate',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'receiveLocal',
            type: 'bool',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'slippage',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'originSender',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'bridgedAmt',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'normalizedIn',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'canonicalId',
            type: 'bytes32',
          },
        ],
        indexed: false,
        internalType: 'struct TransferInfo',
        name: 'params',
        type: 'tuple',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'asset',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'local',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'messageBody',
        type: 'bytes',
      },
    ],
    name: 'XCalled',
    type: 'event',
  },
]

const getXCalledEvents = async (hash) => {
  const { interface } = await ethers.getContractAt(xCalledABI, ADDRESS_ZERO)
  const { logs } = await ethers.provider.getTransactionReceipt(hash)
  const parsedLogs = logs.map((log) => {
    try {
      return interface.parseLog(log)
    } catch (error) {
      return {}
    }
  })

  const xCalled = parsedLogs
    .filter((e) => e !== null)
    .filter(({ name }) => name === 'XCalled')
    .map(({ args }) => args)

  return xCalled
}

const fetchOriginXCall = async ({ transferIds = [], chainId = 1 }) => {
  const query = `
    {
      originTransfers(where:{
        transferId_in: ${JSON.stringify(transferIds)}
      }) {
        chainId
        nonce
        transferId
        to
        delegate
        receiveLocal
        callData
        slippage
        originSender
        originDomain
        destinationDomain
        transactionHash
        bridgedAmt
        status
      }
    }
  `
  const { originTransfers } = await fetchXCall({ query, chainId })
  return originTransfers
}

const fetchDestinationXCall = async ({ transferIds, chainId }) => {
  const query = `
    {
      destinationTransfers(where:{
        transferId_in: ${JSON.stringify(transferIds)}
      }) {
        chainId
        nonce
        transferId
        to
        delegate
        receiveLocal
        callData
        originDomain
        destinationDomain
        delegate
        status
        executedTransactionHash
        reconciledTransactionHash
      }
    }
  `
  const { destinationTransfers } = await fetchXCall({ query, chainId })
  return destinationTransfers
}

// supported chains by domain id
const getSupportedChainsByDomainId = async () => {
  return Object.keys(networks)
    .map((id) => networks[id])
    .filter(
      ({ governanceBridge, isTestNetwork, id }) =>
        !isTestNetwork && !!governanceBridge && id != 1
    )
    .reduce(
      (prev, curr) => ({
        ...prev,
        [curr.governanceBridge.domainId]: curr,
      }),
      {}
    )
}

const connextSubgraphIds = {
  1: `FfTxiY98LJG6zoiAjCXdT34pAmCKDEP8vZRVuC8D5Gf`,
  137: `7mDXK2K6UfkVXiJMhXU8VEFuh7qi2TwdYxeyaRjkmexo`, //plygon
  10: `3115xfkzXPrYzbqDHTiWGtzRDYNXBxs8dyitva6J18jf`, //optimims
  42161: `F325dMRiLVCJpX8EUFHg3SX8LE3kXBUmrsLRASisPEQ3`, // arb
  100: `6oJrPk9YJEU9rWU4DAizjZdALSccxe5ZahBsTtFaGksU`, //gnosis
}

const connextSubgraphURL = (chainId) => {
  // bnb is hosted version
  if (chainId == 56) {
    return 'https://api.thegraph.com/subgraphs/name/connext/amarok-runtime-v0-bnb'
  }
  const { SUBGRAPH_QUERY_API_KEY } = process.env
  if (!SUBGRAPH_QUERY_API_KEY) {
    throw new Error(`Missing SUBGRAPH_QUERY_API_KEY env`)
  }
  const subgraphId = connextSubgraphIds[chainId]
  if (!subgraphId) {
    throw new Error(`Unknown chain id ${chainId}`)
  }
  return `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_QUERY_API_KEY}/subgraphs/id/${subgraphId}`
}

const fetchXCall = async ({ query, chainId }) => {
  const endpoint = connextSubgraphURL(chainId)
  const q = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
    }),
  })

  const { data, errors } = await q.json()
  if (errors) {
    console.log('LOCK > Error while fetching the graph', errors)
    return []
  }
  return data
}

/***
 * Delay Mod Logic
 */

const delayABI = [
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

const getDelayModule = async (delayModuleAddress) => {
  // fetch delayMod address from networks package
  if (!delayModuleAddress) {
    ;({
      governanceBridge: {
        modules: { delayMod: delayModuleAddress },
      },
    } = await getNetwork())
  }
  const delayMod = await ethers.getContractAt(delayABI, delayModuleAddress)

  console.log(`DelayMod at ${delayModuleAddress}`)

  // get the nonces
  const currentNonce = await delayMod.txNonce()
  const queueNonce = await delayMod.queueNonce()
  console.log(`Nonces - current: ${currentNonce}, next ${queueNonce}`)

  return { delayMod, currentNonce, queueNonce }
}

const fetchDataFromTx = async ({ txHash }) => {
  const { interface } = await ethers.getContractAt(delayABI, ADDRESS_ZERO)

  // fetch data from tx
  const { logs } = await ethers.provider.getTransactionReceipt(txHash)
  const parsedLogs = logs.map((log) => {
    try {
      return interface.parseLog(log)
    } catch (error) {
      return {}
    }
  })
  const { args } = parsedLogs.find(({ name }) => name === 'TransactionAdded')
  return args
}

const logStatus = (transferId, status) => {
  const { dest } = status
  const { explorer, name, id } = networks[dest.chainId]
  console.log(`To ${name} (${id}) https://connextscan.io/tx/${transferId} (${
    dest.status
  })
    - executedTransactionHash: ${explorer.urls.transaction(
      dest.executedTransactionHash
    )}
    - reconciledTransactionHash ${explorer.urls.transaction(
      dest.reconciledTransactionHash
    )}\n`)
}

module.exports = {
  getXCalledEvents,
  fetchOriginXCall,
  fetchDestinationXCall,
  getSupportedChainsByDomainId,
  getDelayModule,
  fetchDataFromTx,
  logStatus,
}
