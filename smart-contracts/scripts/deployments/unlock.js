const { ethers, upgrades, run } = require('hardhat')
const { getImplementationAddress } = require('@openzeppelin/upgrades-core')

const {
  copyAndBuildContractAtVersion,
  cleanupContractVersions
} = require('../upgrade/_helpers')

async function main({ unlockVersion } = {}) {
  const [deployer] = await ethers.getSigners()
  let Unlock
  // need to fetch previous unlock versions
  if (unlockVersion) {
    console.log(`Setting up version ${unlockVersion} from package`)
    Unlock = await copyAndBuildContractAtVersion('Unlock', unlockVersion)
  } else {
    console.log(`Deploying development version of Unlock from local source code. Please pass a version number if you want to deploy from a stable release.`)
    Unlock = await ethers.getContractFactory('contracts/Unlock.sol:Unlock')
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
  if(chainId !== 31337) {
    await run('verify:verify', { address: implementation })
  }

  // delete remaining files if we are using a packaged version
  if (unlockVersion) {
    await cleanupContractVersions()
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
