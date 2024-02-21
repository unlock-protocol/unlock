const {
  getXCalledEvents,
  fetchOriginXCall,
  fetchDestinationXCall,
  getSupportedChainsByDomainId,
  logStatus,
} = require('./_lib')

const fs = require('fs-extra')

// small cache to prevent numerous calls to subgraph api
const filepath = './xcalled.json.tmp'

async function main({
  // TODO: pass this hash via cli
  txId = '0x12d380bb7f995930872122033988524727a9f847687eede0b4e1fb2dcb8fce68',
} = {}) {
  console.log(`hello world ${txId}`)

  const xCalls = await getXCalledEvents(txId)

  console.log()

  // sort by domain id
  const sorted = xCalls.reduce((prev, curr) => {
    const { destinationDomain } = curr.params
    return {
      ...prev,
      [destinationDomain]: [...(prev[destinationDomain] || []), curr],
    }
  }, {})

  // query for each chains
  const destChains = await getSupportedChainsByDomainId()

  // store all status for all calls
  let statuses = {}
  if (await fs.exists(filepath)) {
    console.log(`Cache file exists: ${filepath}. Using cache`)
    statuses = await fs.readJSON(filepath)
  } else {
    console.log(`No file cache found: ${filepath}. Fetching results...`)

    // fetch statuses from Connext subgraphs for all calls
    await Promise.all(
      Object.keys(sorted).map(async (domainId) => {
        const xcalls = sorted[domainId]
        const transferIds = xcalls.map(({ transferId }) => transferId)

        // get statuses for all calls
        const originStatuses = await fetchOriginXCall({ transferIds })
        originStatuses.forEach(
          ({ transferId, status, transactionHash, originDomain, chainId }) => {
            statuses[transferId] = {
              origin: { status, chainId, originDomain, transactionHash },
            }
          }
        )

        // get status on destination chain (mainnet)
        const destStatuses = await fetchDestinationXCall({
          transferIds,
          chainId: destChains[domainId].id,
        })
        destStatuses.forEach(
          ({
            transferId,
            status,
            chainId,
            executedTransactionHash,
            reconciledTransactionHash,
            destinationDomain,
          }) => {
            statuses[transferId].dest = {
              status,
              chainId,
              destinationDomain,
              executedTransactionHash,
              reconciledTransactionHash,
            }
          }
        )
      })
    )
    await fs.outputJson(filepath, statuses)
  }

  // log all results

  Object.keys(statuses).map((transferId) =>
    logStatus(transferId, statuses[transferId])
  )
}

// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
