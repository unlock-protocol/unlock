const { ethers } = require('hardhat')
const { fetchFromSubgraph } = require('../../helpers/subgraph')

async function main({ lockAddress }) {
  const PublicLock = await ethers.getContractFactory('PublicLock')
  const lock = PublicLock.attach(lockAddress)

  const { chainId } = await ethers.provider.getNetwork()

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

  const {
    locks: [{ LockManagers }],
  } = await fetchFromSubgraph({ chainId, query })

  const managers = LockManagers.map((m) => m.address)
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
