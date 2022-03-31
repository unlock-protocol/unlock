/**
 * This script is use to check the changes in storage layout between two upgrades
 * using the openzeppellin plugin. It will deploy first the version `LATEST_PUBLIC_LOCK_VERSION`
 * then deploy the version in `contracts/PublicLock.sol`. The errors thrown bu the upgrades plugin
 * should allow to detect changes in storage layout.
 *
 * Usage: `yarn hardhat run scripts/lock/testUpgrade.js`
 */
const { ethers, upgrades, run } = require('hardhat')
const fs = require('fs-extra')
const path = require('path')

const LATEST_PUBLIC_LOCK_VERSION = 9

async function main() {
  const [, lockOwner] = await ethers.getSigners()

  // files path
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

  const pastPublicLockPath = require.resolve(
    `@unlock-protocol/contracts/dist/PublicLock/PublicLockV${LATEST_PUBLIC_LOCK_VERSION}.sol`
  )

  await fs.copy(
    pastPublicLockPath,
    path.resolve(contractsPath, `PublicLockV${LATEST_PUBLIC_LOCK_VERSION}.sol`)
  )

  // re-compile contract using hardhat
  await run('compile')

  const PublicLockPast = await ethers.getContractFactory(
    `contracts/past-versions/PublicLockV${LATEST_PUBLIC_LOCK_VERSION}.sol:PublicLock`
  )

  // deploy a simple lock
  const args = [
    lockOwner.address,
    60 * 60 * 24 * 30, // 30 days
    ethers.constants.AddressZero,
    ethers.utils.parseEther('0.01'),
    130,
    'A neat upgradeable lock!',
  ]
  const lock = await upgrades.deployProxy(PublicLockPast, args)
  await lock.deployed()

  const PublicLockLatest = await ethers.getContractFactory(
    'contracts/PublicLock.sol:PublicLock'
  )
  // deploy new implementation
  await upgrades.upgradeProxy(lock.address, PublicLockLatest, {
    // UNSECURE - but we need the flag as we are resizing the `__gap`
    // unsafeSkipStorageCheck: true,
  })

  await fs.remove(contractsPath)
  await fs.remove(artifactsPath)
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
