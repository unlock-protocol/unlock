const { ethers } = require('hardhat')

async function main() {
  const PublicLock = await ethers.getContractFactory('PublicLock')
  const publicLock = await PublicLock.deploy()
  await publicLock.deployed()

  // eslint-disable-next-line no-console
  console.log(
    `PUBLC LOCK > deployed to : ${publicLock.address} (${publicLock.deployTransaction.hash})`
  )
  // eslint-disable-next-line no-console
  console.log(
    'PUBLC LOCK > Please verify it and call `npx hardhat set template` on the Unlock.'
  )
  return publicLock.address
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
