const { ethers } = require('hardhat')
const fetch = require('cross-fetch')
const { networks } = require('@unlock-protocol/networks')

async function main({ lockAddress }) {
  const PublicLock = await ethers.getContractFactory('PublicLock')
  const lock = PublicLock.attach(lockAddress)

  const { chainId } = await ethers.provider.getNetwork()
  const { subgraphURI } = networks[chainId]

  if (!subgraphURI) {
    console.log(
      'Missing subGraphURI for this network. Can not fetch from The Graph'
    )
    return []
  }

  const query = `
    {
      locks(where:{
        address: "${lockAddress}"
      }) {
        LockManagers {
          address
        }
      }
    }
  `

  const q = await fetch(subgraphURI, {
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

  const {
    locks: [{ LockManagers }],
  } = data
  const managers = LockManagers.map((m) => m.address)

  console.log(`LOCK > managers for the lock '${await lock.name()}':`)
  managers.forEach((account, i) => {
    console.log(`[${i}]: ${account}`)
  })

  return managers
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
