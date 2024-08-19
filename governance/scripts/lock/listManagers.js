const { ethers } = require('hardhat')
const { fetchFromSubgraph } = require('../../helpers/subgraph')
const { getLock } = require('@unlock-protocol/hardhat-helpers')

async function main({ lockAddress }) {
  const { chainId } = await ethers.provider.getNetwork()

  const query = `
    {
      locks(where:{
        address: "${lockAddress}"
      }) {
        lockManagers 
      }
    }
  `

  const {
    locks: [{ LockManagers }],
  } = await fetchFromSubgraph({ chainId, query })

  const managers = LockManagers.map((address) => address)
  const lock = await getLock(lockAddress)
  console.log(
    `LOCK > managers for the lock '${await lock.name()}' (${lockAddress}):`
  )
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
