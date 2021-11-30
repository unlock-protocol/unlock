const { ethers } = require('hardhat')
const { getNetworkName } = require('../../helpers/network')

const fetch = (...args) =>
  // eslint-disable-next-line promise/prefer-await-to-then
  import('node-fetch').then(({ default: fetch }) => fetch(...args))

async function main({ lockAddress }) {
  const PublicLock = await ethers.getContractFactory('PublicLock')
  const lock = PublicLock.attach(lockAddress)

  const { chainId } = await ethers.provider.getNetwork()
  const networkName = chainId === 1 ? 'unlock' : getNetworkName(chainId)

  if (networkName === 'localhost') {
    // eslint-disable-next-line no-console
    console.log('Can not fetch from The Graph on local network')
    return []
  }

  const query = `query {
    lockManagers {
        address
        lock {
          id
        }
      }
    }`

  const q = await fetch(
    `https://api.thegraph.com/subgraphs/name/unlock-protocol/${networkName}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
      }),
    }
  )

  const {
    data: { lockManagers },
  } = await q.json()

  const managers = lockManagers
    .filter((m) => m.lock.id === lockAddress)
    .map((m) => m.address)

  // eslint-disable-next-line no-console
  console.log(`LOCK > managers for the lock '${await lock.name()}':`)
  managers.forEach((account, i) => {
    // eslint-disable-next-line no-console
    console.log(`[${i}]: ${account}`)
  })

  return managers
}

// execute as standalone
if (require.main === module) {
  /* eslint-disable promise/prefer-await-to-then, no-console */
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
