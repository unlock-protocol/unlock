const { fetchFromSubgraph } = require('../../helpers/subgraph')
const { networks } = require('@unlock-protocol/networks')

async function getAllActiveLocks({ timeLimit, chainId }) {
  const limit = 1000
  let skip = 0
  let more = true
  const receipts = []
  while (more) {
    // console.log(`fetching results from  ${skip} to ${limit}`)
    const receiptsQuery = `
    {
      locks(
        skip: ${skip}
        first: ${limit}
        where:{
          or : [
            {
              lastKeyMintedAt_gte: ${BigInt(timeLimit)}
            },
            {
              lastKeyRenewedAt_gte: ${BigInt(timeLimit)}
            }
          ]
        }
      ) {
        address
        version
      }
    }
`
    const { locks: results } = await fetchFromSubgraph({
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

async function getAllLockVersionInfo({ chainId, timeLimit }) {
  // get all locks that still have at least 1 key minted or renewed before the deadline
  const activeLocks = await getAllActiveLocks({ chainId, timeLimit })

  // count by versions
  const count = activeLocks.reduce(
    (prev, { version }) => ((prev[version] = (prev[version] || 0) + 1), prev),
    {}
  )
  const earliest = Object.keys(count)[0]
  const earliestLocks = activeLocks.filter(({ version }) => version == earliest)
  return {
    chainId,
    activeLocks,
    earliestLocks,
    earliest,
    count,
  }
}

function logLocks({ chainId, activeLocks, earliest, earliestLocks, count }) {
  const { name } = networks[chainId]
  console.log(
    `${name} (${chainId}): 
    - locks: ${activeLocks.length} unique locks
    - earliest version ${earliest} 
    - versions: ${Object.keys(count)
      .map((v) => `v${v}:${count[v]}`)
      .join(',')}
    `
  )
}

async function main({ deadline = '2022-01-01' } = {}) {
  console.log(`locks before ${deadline}`)
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
