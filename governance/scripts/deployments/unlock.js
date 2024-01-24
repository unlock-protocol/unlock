const { ethers, run } = require('hardhat')

const {
  isLocalhost,
  copyAndBuildContractsAtVersion,
  cleanupContractVersions,
  deployUpgradeableContract,
} = require('@unlock-protocol/hardhat-helpers')

async function main({ unlockVersion } = {}) {
  const [deployer] = await ethers.getSigners()
  let Unlock
  // need to fetch previous unlock versions
  if (unlockVersion) {
    console.log(`Setting up version ${unlockVersion} from package`)
    Unlock = (
      await copyAndBuildContractsAtVersion(__dirname, [
        { contractName: 'Unlock', version: unlockVersion },
      ])
    )[0]
  } else {
    throw 'Need to set --unlock-version'
  }

  // deploy proxy w impl
  const {
    address: unlockAddress,
    implementation,
    hash,
  } = await deployUpgradeableContract(Unlock, [deployer.address], {
    initializer: 'initialize(address)',
  })
  // eslint-disable-next-line no-console
  console.log(
    `UNLOCK SETUP > Unlock proxy deployed to: ${unlockAddress} (tx: ${hash}) `,
    `- implementation at: ${implementation}`
  )

  if (!(await isLocalhost())) {
    await run('verify:verify', { address: implementation })
  }

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
