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

  console.log('CLONE LOCK > add key owners...')
  const newLock = PublicLock.attach(newLockAddress)
  const { keyOwners, expirationTimestamps, keyManagers } = serializedLock
  const keyTx = await newLock.grantKeys(
    keyOwners,
    expirationTimestamps,
    keyManagers
  )
  const { events: keyEvents } = await keyTx.wait()
  const transfers = keyEvents.filter(({ event }) => event === 'Transfer')
  const keyManagersChanges = keyEvents.filter(
    ({ event }) => event === 'KeyManagerChanged'
  )

  console.log(
    `CLONE LOCK > ${transfers.length} keys transferred, ${keyManagersChanges.length} key managers changed`
  )

  console.log('CLONE LOCK > fetching managers...')

  // fetch managers from graph
  const managers = await listManagers({ lockAddress })

  // add back managers to the lock
  if (managers.length) {
    // eslint-disable-next-line no-restricted-syntax
    const txs = await Promise.all(
      managers.map((manager) => newLock.addLockManager(manager))
    )
    const waits = await Promise.all(txs.map((tx) => tx.wait()))
    waits.forEach(({ events }) => {
      const evt = events.find(({ event }) => event === 'LockManagerAdded')

      console.log(`LOCK CLONE > ${evt.args.account} added as lock manager.`)
    })
  }
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
