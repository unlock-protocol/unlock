/**
 * Script to check the status of all bridge calls contained in a specific
 * tx
 *
 * Usage:
 * 1. export the `txId` from the DAO proposal execution tx as PROPOSAL_EXECUTION_TX
 * 2. run the script with :
 *  `yarn hardhat run scripts/bridge/status.js --network mainnet`
 */
const {
  getXCalledEventsFromTx,
  fetchOriginXCall,
  fetchDestinationXCall,
  getSupportedChainsByDomainId,
  logStatus,
} = require('../../helpers/bridge')

const fs = require('fs-extra')

// small cache to prevent numerous calls to subgraph api
const filepath = './xcalled.tmp.json'

async function main({
  // if of the tx from the DAO proposal execution
  txId = process.env.PROPOSAL_EXECUTION_TX,
} = {}) {
  if (!txId) {
    throw Error(
      `Missing txId. Please export PROPOSAL_EXECUTION_TX in your shell`
    )
  }
  const xCalls = await getXCalledEventsFromTx(txId)

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
    console.log(`Cache file exists: ${filepath}. Deleting.`)
    await fs.rm(filepath)
  }

  console.log(`Fetching results...`)

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
  await fs.outputJson(filepath, statuses, { spaces: 2 })

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
