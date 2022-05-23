const { ethers } = require('hardhat')

const CURRENT_VERSION = 10

async function main({ publicLockAddress, unlockAddress, unlockVersion }) {
  if (!publicLockAddress) {
    // eslint-disable-next-line no-console
    throw new Error(
      'UNLOCK SET TEMPLATE > Missing template address... aborting.'
    )
  }
  if (!unlockAddress) {
    // eslint-disable-next-line no-console
    throw new Error('UNLOCK SET TEMPLATE > Missing Unlock address... aborting.')
  }

  // get unlock instance
  let unlock
  if (unlockVersion < CURRENT_VERSION) {
    const contracts = require('@unlock-protocol/contracts')
    const { abi } = contracts[`UnlockV${unlockVersion}`]
    unlock = await ethers.getContractAt(abi, unlockAddress)
  } else {
    unlock = await ethers.getContractAt('Unlock', unlockAddress)
    unlockVersion = await unlock.unlockVersion()
  }

  // set lock template
  const publicLock = await ethers.getContractAt('PublicLock', publicLockAddress)
  const version = await publicLock.publicLockVersion()
  if (unlockVersion > 9) {
    // eslint-disable-next-line no-console
    console.log(
      `LOCK TEMPLATE SETUP > Setting up PublicLock version ${version}`
    )
    const txVersion = await unlock.addLockTemplate(publicLockAddress, version)
    await txVersion.wait()
  }

  // set lock template
  const tx = await unlock.setLockTemplate(publicLockAddress)
  const { transactionHash } = await tx.wait()
  // eslint-disable-next-line no-console
  console.log(`UNLOCK SETUP> Template set for Lock (tx: ${transactionHash})`)
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
