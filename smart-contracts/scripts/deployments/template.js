const { ethers } = require('hardhat')
const { addDeployment } = require('../../helpers/deployments')

async function main() {
  const PublicLock = await ethers.getContractFactory('PublicLock')
  const publicLock = await PublicLock.deploy()
  await publicLock.deployed()

  // eslint-disable-next-line no-console
  console.log(
    `PUBLIC LOCK > deployed to : ${publicLock.address} (tx: ${publicLock.deployTransaction.hash})`
  )
  // eslint-disable-next-line no-console
  console.log(
    'PUBLIC LOCK > Please verify it and call `yarn hardhat set:template`.'
  )

  // save deployment info
  await addDeployment('PublicLock', publicLock, false)

  return publicLock.address
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
