const { ethers, upgrades, run } = require('hardhat')
const { getImplementationAddress } = require('@openzeppelin/upgrades-core')

const {
  copyAndBuildContractsAtVersion,
  cleanupContractVersions,
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

  const unlock = await upgrades.deployProxy(Unlock, [deployer.address], {
    initializer: 'initialize(address)',
  })
  await unlock.deployed()

  // eslint-disable-next-line no-console
  const implementation = await getImplementationAddress(
    ethers.provider,
    unlock.address
  )
  console.log(
    `UNLOCK SETUP > Unlock proxy deployed to: ${unlock.address} (tx: ${unlock.deployTransaction.hash}) `,
    `- implementation at: ${implementation}`
  )

  const { chainId } = await ethers.provider.getNetwork()
  if (chainId !== 31337) {
    await run('verify:verify', { address: implementation })
  }

  // delete remaining files if we are using a packaged version
  if (unlockVersion) {
    await cleanupContractVersions(__dirname)
  }

  return unlock.address
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
