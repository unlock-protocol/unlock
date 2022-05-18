const { ethers } = require('hardhat')

async function main({ lockAddress, tokenId, referrer }) {
  const PublicLock = await ethers.getContractFactory('PublicLock')
  const lock = PublicLock.attach(lockAddress)

  if ((await lock.publicLockVersion()) < 10) {
    throw new Error('Renewal only available for v10+')
  }
  // default to address zero
  referrer = referrer || ethers.constants.AddressZero

  const tx = await lock.renewMembershipFor(tokenId, referrer)
  const receipt = await tx.wait()

  // eslint-disable-next-line no-console
  console.log(receipt)
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
