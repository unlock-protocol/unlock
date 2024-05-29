const { ethers } = require('hardhat')

async function main({ lockAddress }) {
  if (!lockAddress) {
    // eslint-disable-next-line no-console
    throw new Error('LOCK UPGRADE > Missing lock address... aborting.')
  }

  // get lock
  const lock = await ethers.getContractAt('PublicLock', lockAddress)
  const currentVersion = await lock.publicLockVersion()

  // get unlock instance
  const unlockAddress = await lock.unlockProtocol()
  const unlock = await ethers.getContractAt('Unlock', unlockAddress)

  // perform upgrade
  const nextVersion = currentVersion + 1
  const tx = await unlock.upgradeLock(lockAddress, nextVersion)
  const { transactionHash } = await tx.wait()
  // eslint-disable-next-line no-console
  console.log(
    `LOCK UPGRADE> Lock upgraded  ${currentVersion} > ${nextVersion} (tx: ${transactionHash})`
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
