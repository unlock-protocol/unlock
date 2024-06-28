const { fetchFromSubgraph } = require('../../helpers/subgraph')
const { networks } = require('@unlock-protocol/networks')

async function getAllReceipts({ timeLimit, chainId }) {
  const limit = 1000
  let skip = 0
  let more = true
  const receipts = []
  while (more) {
    // console.log(`fetching results from  ${skip} to ${limit}`)
    const receiptsQuery = `
    {
      receipts(
        skip: ${skip}
        first: ${limit}
        where:{
          timestamp_gte: ${timeLimit} 
        }
        ) {
        lockAddress
      }
    }
`
    const { receipts: results } = await fetchFromSubgraph({
      chainId,
      query: receiptsQuery,
    })

    if (results.length < limit) {
      more = false
    } else {
      skip += limit
    }
    receipts.push(...results)
  }
  return receipts
}

async function getLockVersions({ chainId, lockAddresses }) {
  const versionsQuery = `
      {
        locks(
          orderBy: version
          sortDirection: DESC
          where:{
            address_in: ${JSON.stringify(lockAddresses)}
            
          }
        ) {
          version
          address
        }
      }
    `

  const { locks } = await fetchFromSubgraph({
    chainId,
    query: versionsQuery,
  })

  // append chainId
  return locks.map((lock) => ({ ...lock, chainId }))
}

async function getAllLockVersionInfo({ chainId, timeLimit }) {
  // get all receipts before the date
  const receipts = await getAllReceipts({ chainId, timeLimit })

  // parse all addresses
  const lockAddresses = receipts
    .map(({ lockAddress }) => lockAddress)
    .reduce((prev, curr) => (!prev.includes(curr) ? [...prev, curr] : prev), [])

  // get all receipts before the date
  const versions = await getLockVersions({ chainId, lockAddresses })
  const count = versions.reduce(
    (prev, { version }) => ((prev[version] = (prev[version] || 0) + 1), prev),
    {}
  )
  const earliest = Object.keys(count)[0]
  const earliestLocks = versions.filter(({ version }) => version == earliest)
  return {
    chainId,
    receipts,
    lockAddresses,
    earliest,
    earliestLocks,
    count,
  }
}

function logLocks({
  chainId,
  receipts,
  lockAddresses,
  earliest,
  earliestLocks,
  count,
}) {
  const { name } = networks[chainId]
  console.log(
    `${name} (${chainId}): 
    - receipts: ${receipts.length}
    - locks: ${lockAddresses.length} unique lock addresses
    - earliest version ${earliest} 
    - earliest ${earliestLocks.length} locks (${parseInt(earliest) < 9 ? earliestLocks.map(({ address }) => address).join(',') : ''})
    - versions: ${Object.keys(count)
      .map((v) => `v${v}:${count[v]}`)
      .join(',')}
    `
  )
}

async function main({ deadline = '2022-01-01' } = {}) {
  console.log(`Before ${deadline}`)
  const timeLimit = new Date(deadline).getTime() / 1000

  const chains = Object.keys(networks).filter(
    (id) => !isNaN(parseInt(id)) && !networks[id].isTestNetwork
  )
  console.log(`Chains: ${chains.join(',')} `)
  const infos = {}
  await Promise.all(
    chains.map(async (chainId) => {
      try {
        const info = await getAllLockVersionInfo({ chainId, timeLimit })
        infos[chainId] = info
        logLocks(info)
      } catch (error) {
        console.log(`Couldn't fetch chain ${chainId}: ${error.message}`)
      }
    })
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
