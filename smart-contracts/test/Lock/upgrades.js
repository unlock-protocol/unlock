const { ethers, upgrades, run } = require('hardhat')
const fs = require('fs-extra')
const path = require('path')

// const {
//   LATEST_PUBLIC_LOCK_VERSION,
// } = require('../helpers/constants')

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

const versionNumber = 9

describe('PublicLock upgrades', () => {
  let lock
  let PublicLockLatest
  let PublicLockPast

  const pastPublicLockPath = require.resolve(
    `@unlock-protocol/contracts/dist/PublicLock/PublicLockV${versionNumber}.sol`
  )

  before(async function copyAndBuildContract() {
    // make sure mocha doesnt time out
    this.timeout(200000)

    await fs.copy(
      pastPublicLockPath,
      path.resolve(contractsPath, `PublicLockV${versionNumber}.sol`)
    )

    // re-compile contract using hardhat
    await run('compile')
  })

  after(async () => {
    await fs.remove(contractsPath)
    await fs.remove(artifactsPath)
  })

  beforeEach(async () => {
    PublicLockPast = await ethers.getContractFactory(
      `contracts/past-versions/PublicLockV${versionNumber}.sol:PublicLock`
    )
    PublicLockLatest = await ethers.getContractFactory(
      'contracts/PublicLock.sol:PublicLock'
    )

    const [, lockOwner] = await ethers.getSigners()
    // deploy a simple lock
    const args = [
      lockOwner.address,
      60 * 60 * 24 * 30, // 30 days
      ethers.constants.AddressZero,
      ethers.utils.parseEther('0.01'),
      10,
      'A neat upgradeable lock!',
    ]

    lock = await upgrades.deployProxy(PublicLockPast, args)
    await lock.deployed()
  })

  it('should allow upgrade', async () => {
    // deploy new implementation
    await upgrades.upgradeProxy(lock.address, PublicLockLatest)
  })
})
