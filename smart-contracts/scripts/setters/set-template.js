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

  // set lock template
  unlock.setLockTemplate(publicLockAddress, {
    from: deployer.address,
    gasLimit: constants.MAX_GAS,
  })
  // eslint-disable-next-line no-console
  console.log('UNLOCK SETUP> Template set for Lock')
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
