const { ethers, upgrades } = require('hardhat')
const { expect } = require('chai')

const {
  UNLOCK_ADDRESS,
  impersonate,
  createLock
} = require('../helpers')


describe(`Unlock migration`, function() {

  let unlock, publicLock, unlockModified, lock

  before(async function() {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }

    // get original Unlock contract
    unlock = await ethers.getContractAt('Unlock', UNLOCK_ADDRESS)

    // impersonate old Unlock owner
    let oldUnlockOwner = await unlock.owner()
    await impersonate(oldUnlockOwner)
    oldUnlockOwner = await ethers.getSigner(oldUnlockOwner)

    // deploy new template
    const PublicLockV13 = await ethers.getContractFactory('PublicLock');
    publicLock = await PublicLockV13.deploy()
    await publicLock.deployed()
    console.log(`PublicLockV13 > deployed at ${publicLock.address}`)

    // redeploy new Unlock
    const UnlockModified = await ethers.getContractFactory('UnlockModified');
    unlockModified = await upgrades.deployProxy(UnlockModified)
    console.log(`UnlockModified > deployed at ${unlockModified.address}`)

    // create a (v12) lock
    lock = await createLock({ unlock })

    // set a new tempalte in old unlock
    await unlock.connect(oldUnlockOwner).addLockTemplate(publicLock.address, 13)
    await unlock.connect(oldUnlockOwner).setLockTemplate(publicLock.address)
    console.log(`UNLOCK (old) > upgrade template to ${await unlock.publicLockLatestVersion()}`)

    // set old Unlock address in new Unlock
    await unlockModified.setPreviousUnlockAddress(unlock.address)


  })

  describe('Old Unlock settings', () => {
    it('correct v13 template', async () => {
      expect(await unlock.publicLockAddress()).to.equals(publicLock.address)
      expect(await unlock.publicLockLatestVersion()).to.equals(13)
    })
  })

  describe('Lock upgrade', () => {
    before(async () => {
      expect(await lock.publicLockVersion()).to.equals(12)
      // upgrade the lock
      await unlock.upgradeLock(lock.address, 13)
      console.log(`Unlock (old) > lock upgraded to v${13}`)
    })
    it('upgrade version correctly', async () => {
      expect(await lock.publicLockVersion()).to.equals(12)
    })
    it('show previous unlock address', async () => {
      expect(await lock.unlockProtocol()).to.equals(unlock.address)
    })
  })

  describe('Migrate lock', () => {
    before(async () => {
      // set new Unlock address in lock
      const calldata = ethers.utils.defaultAbiCoder.encode(
        ['address'],
        [unlockModified.address]
        )
      await lock.migrate(calldata)
    })
    it('show previous unlock address', async () => {
      expect(await lock.unlockProtocol()).to.equals(unlockModified.address)
    })
  })
  
})