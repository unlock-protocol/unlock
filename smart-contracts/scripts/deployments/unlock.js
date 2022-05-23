const { ethers, upgrades, run } = require('hardhat')
const fs = require('fs-extra')
const path = require('path')

const { addDeployment } = require('../../helpers/deployments')

const CURRENT_VERSION = 10

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

async function main({ unlockVersion = 10 }) {
  const [deployer] = await ethers.getSigners()
  let Unlock
  // need to fetch previous unlock versions
  if (unlockVersion < CURRENT_VERSION) {
    // eslint-disable-next-line no-console
    console.log(`UNLOCK SETUP > Setting up version ${unlockVersion}`)

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
    Unlock = await ethers.getContractFactory('contracts/Unlock.sol:Unlock')
  }

  const unlock = await upgrades.deployProxy(Unlock, [deployer.address], {
    initializer: 'initialize(address)',
  })
  await unlock.deployed()

  // eslint-disable-next-line no-console
  console.log(
    `UNLOCK SETUP > Unlock (w proxy) deployed to: ${unlock.address} (tx: ${unlock.deployTransaction.hash})`
  )

  // delete remaining artifact
  if (unlockVersion < CURRENT_VERSION) {
    await fs.remove(artifactsPath)
  }

  // save deployment info
  await addDeployment('Unlock', unlock, true)

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
