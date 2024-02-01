const { ethers } = require('hardhat')

const {
  copyAndBuildContractsAtVersion,
  cleanupContractVersions,
  deployUpgradeableContract,
} = require('@unlock-protocol/hardhat-helpers')

async function main({ unlockVersion } = {}) {
  const [deployer] = await ethers.getSigners()
  // need to fetch previous unlock versions
  if (!unlockVersion) {
    throw 'Need to set --unlock-version'
  }

  console.log(`Setting up version ${unlockVersion} from package`)

  const [qualifiedPath] = await copyAndBuildContractsAtVersion(__dirname, [
    { contractName: 'Unlock', version: unlockVersion },
  ])

  // deploy proxy w impl
  const {
    address: unlockAddress,
    implementation,
    hash,
  } = await deployUpgradeableContract(qualifiedPath, [deployer.address], {
    initializer: 'initialize(address)',
  })

  // eslint-disable-next-line no-console
  console.log(
    `UNLOCK SETUP > Unlock proxy deployed to: ${unlockAddress} (tx: ${hash}) `,
    `- implementation at: ${implementation}`
  )

  // delete remaining files if we are using a packaged version
  if (unlockVersion) {
    await cleanupContractVersions(__dirname)
  }

  return unlockAddress
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
