const { ethers } = require('hardhat')
const createLock = require('../deployments/lock.js')

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

  console.log(newLockAddress)
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
