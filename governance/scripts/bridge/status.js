const {
  getXCalledEvents,
  fetchOriginXCall,
  fetchDestinationXCall,
  getSupportedChainsByDomainId,
} = require('./_lib')

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
  const statuses = {}
  await Promise.all(
    Object.keys(sorted).map(async (domainId) => {
      const xcalls = sorted[domainId]
      const transferIds = xcalls.map(({ transferId }) => transferId)

      // get statuses for all calls
      const originStatuses = await fetchOriginXCall({ transferIds })
      originStatuses.forEach(
        ({ transferId, status, transactionHash, originDomain }) => {
          statuses[transferId] = {
            origin: { status, originDomain, transactionHash },
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
          executedTransactionHash,
          reconciledTransactionHash,
          destinationDomain,
        }) => {
          statuses[transferId].dest = {
            status,
            destinationDomain,
            executedTransactionHash,
            reconciledTransactionHash,
          }
        }
      )
    })
  )

  // log all results
  Object.keys(statuses).forEach((transferId) => {
    const { origin, dest } = statuses[transferId]
    const { explorer, name, id } = destChains[dest.destinationDomain]
    console.log(`To ${name} (${id}) - ${transferId}
  - origin (${origin.status}) - tx : ${explorer.urls.transaction(
    origin.transactionHash
  )}
  - dest (${dest.status})
    - executedTransactionHash: ${explorer.urls.transaction(
      dest.executedTransactionHash
    )}
    - reconciledTransactionHash ${explorer.urls.transaction(
      dest.reconciledTransactionHash
    )}\n`)
  })
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
