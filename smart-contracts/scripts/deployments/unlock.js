const { ethers, upgrades, run } = require('hardhat')
const { getImplementationAddress } = require('@openzeppelin/upgrades-core')
const fs = require('fs-extra')
const path = require('path')

const contractsPath = path.resolve(
  __dirname,
  '..',
  '..',
  'contracts',
  'past-versions'
)

const artifactsPath = path.resolve(
  __dirname,
  '..',
  '..',
  'artifacts',
  'contracts',
  'past-versions'
)

async function main({ unlockVersion }) {
  const [deployer] = await ethers.getSigners()
  let Unlock
  // need to fetch previous unlock versions
  if (unlockVersion) {
    // eslint-disable-next-line no-console
    console.log(`UNLOCK SETUP > Setting up version ${unlockVersion} from package`)

    // need to copy .sol for older versions in contracts repo
    const pastUnlockPath = require.resolve(
      `@unlock-protocol/contracts/dist/Unlock/UnlockV${unlockVersion}.sol`
    )
    await fs.copy(
      pastUnlockPath,
      path.resolve(contractsPath, `UnlockV${unlockVersion}.sol`)
    )
    // re-compile contract
    await run('compile')

    // delete .sol file now that we have artifact
    await fs.remove(contractsPath)

    // get factory using fully qualified path
    Unlock = await ethers.getContractFactory(
      `contracts/past-versions/UnlockV${unlockVersion}.sol:Unlock`
    )
  } else {
    console.log(`Deploying development version of Unlock from local source code. Please pass a version number if you want to deploy from a stable release.`)
    Unlock = await ethers.getContractFactory('contracts/Unlock.sol:Unlock')
  }

  const unlock = await upgrades.deployProxy(Unlock, [deployer.address], {
    initializer: 'initialize(address)',
    unsafeAllow: ['delegatecall']
  })
  await unlock.deployed()

  // eslint-disable-next-line no-console
  console.log(
    `UNLOCK SETUP > Unlock proxy deployed to: ${unlock.address} (tx: ${unlock.deployTransaction.hash}) `,
    `- implementation at: ${await getImplementationAddress(
      ethers.provider,
      unlock.address
    )}`
  )

  // delete remaining artifact if using a packaged version
  if (unlockVersion) {
    await fs.remove(artifactsPath)
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
