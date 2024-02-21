const { ethers } = require('hardhat')
const { ADDRESS_ZERO } = require('@unlock-protocol/hardhat-helpers')
const { networks } = require('@unlock-protocol/networks')

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
  console.log(query)
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

const subgraphIds = {
  1: `FfTxiY98LJG6zoiAjCXdT34pAmCKDEP8vZRVuC8D5Gf`,
  137: `7mDXK2K6UfkVXiJMhXU8VEFuh7qi2TwdYxeyaRjkmexo`, //plygon
  10: `3115xfkzXPrYzbqDHTiWGtzRDYNXBxs8dyitva6J18jf`, //optimims
  42161: `F325dMRiLVCJpX8EUFHg3SX8LE3kXBUmrsLRASisPEQ3`, // arb
  100: `6oJrPk9YJEU9rWU4DAizjZdALSccxe5ZahBsTtFaGksU`, //gnosis
}

const subgraphURL = (chainId) => {
  // bnb is hosted version
  if (chainId == 56) {
    return 'https://api.thegraph.com/subgraphs/name/connext/amarok-runtime-v0-bnb'
  }
  const { SUBGRAPH_QUERY_API_KEY } = process.env
  if (!SUBGRAPH_QUERY_API_KEY) {
    throw new Error(`Missing SUBGRAPH_QUERY_API_KEY env`)
  }
  const subgraphId = subgraphIds[chainId]
  if (!subgraphId) {
    throw new Error(`Unknown chain id ${chainId}`)
  }
  return `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_QUERY_API_KEY}/subgraphs/id/${subgraphId}`
}

const fetchXCall = async ({ query, chainId }) => {
  const endpoint = subgraphURL(chainId)
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

module.exports = {
  getXCalledEvents,
  fetchOriginXCall,
  fetchDestinationXCall,
  getSupportedChainsByDomainId,
}
