const { ethers } = require('hardhat')
const createLock = require('../deployments/lock')
const listManagers = require('./listManagers')

async function main({
  lockAddress,
  unlockAddress,
  unlockVersion,
  serializerAddress,
}) {
  const PublicLock = await ethers.getContractFactory('PublicLock')
  const lock = PublicLock.attach(lockAddress)

  // eslint-disable-next-line no-console
  console.log(`CLONE LOCK > serializing: ${await lock.name()}...`)

  const Serializer = await ethers.getContractFactory('LockSerializer')
  const serializer = Serializer.attach(serializerAddress)
  const serializedLock = await serializer.serialize(lockAddress)

  // create the new lock
  const newLockAddress = await createLock({
    serializedLock,
    unlockAddress,
    unlockVersion,
    salt: web3.utils.randomHex(12),
  })

  // eslint-disable-next-line no-console
  console.log('CLONE LOCK > fetching managers...')

  // fetch managers from graph
  const managers = await listManagers({ lockAddress: newLockAddress })

  // add back managers to the lock
  if (managers.length) {
    // eslint-disable-next-line no-restricted-syntax
    const txs = Promise.all(
      managers.map((manager) => lock.addLockManager(manager))
    )
    const { events } = await txs.wait()
    const added = events.map(({ event }) => event.name === 'LockManagerAdded')
    added.forEach(({ args }) => {
      // eslint-disable-next-line no-console
      console.log(`LOCK CLONE > ${args[0]} added as lock manager.`)
    })
  }
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
