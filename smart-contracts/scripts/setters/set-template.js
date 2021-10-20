const { constants } = require('hardlydifficult-eth')
const { ethers } = require('hardhat')

async function main({ publicLockAddress, unlockAddress }) {
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

  const [deployer] = await ethers.getSigners()

  // get unlock instance
  const Unlock = await ethers.getContractFactory('Unlock')
  const unlock = Unlock.attach(unlockAddress)

  const existingTemplate = await unlock.publicLockAddress()

  if (existingTemplate === ethers.utils.getAddress(publicLockAddress)) {
    // eslint-disable-next-line no-console
    console.log('UNLOCK SETUP > Template already set for PublicLock')
    return
  }

  // set lock template
  const tx = await unlock.setLockTemplate(publicLockAddress, {
    from: deployer.address,
    gasLimit: constants.MAX_GAS,
  })
  const { transactionHash } = await tx.wait()

  // eslint-disable-next-line no-console
  console.log(`UNLOCK SETUP> Template set for Lock (tx: ${transactionHash})`)
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
