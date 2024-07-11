const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')

async function main({ lockAddress }) {
  const { chainId } = await ethers.provider.getNetwork()
  const { subgraph } = networks[chainId]

  if (!subgraph || !subgraph.endpoint) {
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
        lockManagers 
      }
    }
  `

  const q = await fetch(subgraph.endpoint, {
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
    locks: [{ lockManagers }],
  } = data
  console.log(lockManagers)
  const managers = lockManagers.map((address) => address)

  console.log(`LOCK > managers for the lock (${lockAddress}):`)
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
