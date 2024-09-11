/**
 * List versions of Locks on all chains
 *
 * Runing the script will output a markdown-formatted list of locks with
 * versions, addresses, etc
 *
 * usage:
 *
 * // update date limit and versions in the script
 * yarn hardhat run scripts/lock/checkVersions.js
 *
 */
const { fetchFromSubgraph } = require('../../helpers/subgraph')
const { getProvider } = require('../../helpers/multisig')
const contracts = require('@unlock-protocol/contracts')

const { networks } = require('@unlock-protocol/networks')
const { Contract, formatUnits } = require('ethers')
const {
  ADDRESS_ZERO,
  getERC20Contract,
  getNetwork,
} = require('@unlock-protocol/hardhat-helpers')

// lock prior to that date won't be checked
const DEADLINE = '2022-01-01'

// for all locks with versions earlier or equal to this number, detailed info is shown
const LATEST_VERSION_TO_DETAIL = 9

async function getLockBalance({ chainId, lock }) {
  const { provider } = await getProvider(chainId)
  const { nativeCurrency } = await getNetwork(chainId)

  // check native
  const balanceNative = await provider.getBalance(lock.address)

  // check ERC20
  const { abi } = contracts[`PublicLockV${lock.version}`]
  const lockContract = new Contract(lock.address, abi, provider)
  const tokenAddress = await lockContract.tokenAddress()

  let balanceToken = 0n
  let balanceTokenParsed = ''
  if (tokenAddress !== ADDRESS_ZERO) {
    const token = await getERC20Contract(tokenAddress, provider)
    const decimals = await token.decimals()
    balanceToken = await token.balanceOf(lock.address)
    balanceTokenParsed = `${formatUnits(balanceToken, decimals)} ${await token.symbol()}`
  }
  return {
    chainId,
    ...lock,
    balanceNative,
    balanceToken,
    balanceFormatted: `${balanceToken === 0n ? '' : balanceTokenParsed} ${balanceNative === 0n ? '' : `${formatUnits(balanceNative, 18)} ${nativeCurrency.symbol}`}`,
  }
}

async function fetchAllActiveLocks({ timeLimit, chainId }) {
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
        lastKeyMintedAt
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

const count = (locks) =>
  locks.reduce(
    (prev, { version }) => ((prev[version] = (prev[version] || 0) + 1), prev),
    {}
  )

async function getAllLocks({ chainId, timeLimit }) {
  // get all locks that still have at least 1 key minted or renewed before the deadline
  const activeLocks = await fetchAllActiveLocks({ chainId, timeLimit })

  // count by versions
  const versionCount = count(activeLocks)
  const earliest = Object.keys(count)[0]

  // check balance on the earliest locks
  const earlyLocks = (
    await Promise.all(
      activeLocks
        .filter(({ version }) => version <= LATEST_VERSION_TO_DETAIL)
        .map((lock) => getLockBalance({ chainId, lock }))
    )
  )
    // .filter(
    //   ({ balanceNative, balanceToken }) =>
    //     balanceNative !== 0n || balanceToken !== 0n
    // )
    .sort(({ version: a }, { version: b }) => b - a)

  return {
    chainId,
    activeLocks,
    earliest,
    versions: versionCount,
    earlyLocks,
  }
}

function logLocks({ chainId, activeLocks, earliest, earlyLocks, versions }) {
  const { name, explorer } = networks[chainId]
  console.log(
    `## ${name} (${chainId}):

- **locks**: ${activeLocks.length} unique locks
- **earliest version**: ${earliest} 
- **versions**: ${Object.keys(versions)
      .map((v) => `v${v}:${versions[v]}`)
      .join(',')}

${
  earlyLocks.length
    ? `
### Locks v8 and v9 (total: ${earlyLocks.length})

| address | version | balance | lastKeyMinted |
| --- | --- | --- | --- | 
  ${earlyLocks
    .sort((a, b) => b.lastKeyMintedAt - a.lastKeyMintedAt)
    .map(
      ({ address, balanceFormatted, lastKeyMintedAt, version }) =>
        `| [${address}](${explorer.urls.address(address)}) | v${version} | ${balanceFormatted} | ${new Date(lastKeyMintedAt * 1000).toLocaleDateString('en-US')} |`
    )
    .join('\n')}`
    : ''
}
`
  )
}

async function main({ deadline = DEADLINE } = {}) {
  console.log(`locks before ${deadline}`)
  const timeLimit = new Date(deadline).getTime() / 1000

  const chains = Object.keys(networks).filter(
    (id) => !isNaN(parseInt(id)) && !networks[id].isTestNetwork
  )

  console.log(`Chains: ${chains.join(',')} `)
  const recentLocks = {}
  await Promise.all(
    chains.map(async (chainId) => {
      try {
        const locks = await getAllLocks({ chainId, timeLimit })
        // earliest ${earliestLocks.length} locks (${parseInt(earliest) < 9 ? earliestLocks.map(({ address }) => address).join(',') : ''})
        recentLocks[chainId] = locks
        logLocks(locks)
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
