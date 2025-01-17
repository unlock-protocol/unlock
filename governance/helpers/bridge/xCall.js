const { ethers } = require('hardhat')
const { ADDRESS_ZERO } = require('@unlock-protocol/hardhat-helpers')
const { networks } = require('@unlock-protocol/networks')
const IXCalled = require('./abis/IXCalled')

const targetChains = Object.keys(networks)
  .map((id) => networks[id])
  .filter(
    ({ id, dao, isTestNetwork }) =>
      !isTestNetwork && !!dao && id !== dao.chainId
  )

/***
 * CONNEXT logic
 */
const getXCalledEventsFromTx = async (hash) => {
  const { logs } = await ethers.provider.getTransactionReceipt(hash)
  return await parseXCalledEvents(logs)
}

const parseXCalledEvents = async (logs) => {
  const { interface } = await ethers.getContractAt(IXCalled, ADDRESS_ZERO)
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

const fetchOriginXCall = async ({ transferIds = [], chainId = 8453 }) => {
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
    .filter(({ dao, isTestNetwork }) => !isTestNetwork && !!dao)
    .reduce(
      (prev, curr) => ({
        ...prev,
        [curr.dao.governanceBridge.domainId]: curr,
      }),
      {}
    )
}

const connextSubgraphIds = {
  1: `FfTxiY98LJG6zoiAjCXdT34pAmCKDEP8vZRVuC8D5Gf`,
  137: `7mDXK2K6UfkVXiJMhXU8VEFuh7qi2TwdYxeyaRjkmexo`, //polygon
  10: `3115xfkzXPrYzbqDHTiWGtzRDYNXBxs8dyitva6J18jf`, //optimims
  42161: `F325dMRiLVCJpX8EUFHg3SX8LE3kXBUmrsLRASisPEQ3`, // arb
  100: `6oJrPk9YJEU9rWU4DAizjZdALSccxe5ZahBsTtFaGksU`, //gnosis
  8453: `4YtEYNhpX6x1G21wra23DQF871yNs62D6H2E98EY3uCd`, // base
}

const connextSubgraphURL = (chainId) => {
  // bnb is hosted version
  // check https://github.com/connext/monorepo/blob/7758e62037bba281b8844c37831bde0b838edd36/packages/adapters/subgraph/.graphclientrc.yml#L7
  if (chainId == 56) {
    return 'https://connext.bwarelabs.com/subgraphs/name/connext/amarok-runtime-v1-bnb'
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

module.exports = {
  targetChains,
  parseXCalledEvents,
  getXCalledEventsFromTx,
  fetchOriginXCall,
  fetchDestinationXCall,
  getSupportedChainsByDomainId,
}
