const { ethers, upgrades, network } = require('hardhat')
const { expect } = require('chai')

const {
  UNLOCK_ADDRESS,
  impersonate,
  deployLock,
  purchaseKey
} = require('../helpers')
const { getProxyAdminAddress } = require('../../helpers/deployments')


let unlock, publicLock, unlockModified, lock, signer, keyOwner

describe(`Unlock migration`, function() {


  before(async function() {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }

    ;[signer, keyOwner] = await ethers.getSigners()

    // get original Unlock contract
    unlock = await ethers.getContractAt('Unlock', UNLOCK_ADDRESS)

    // impersonate old Unlock owner
    let oldUnlockOwner = await unlock.owner()
    await impersonate(oldUnlockOwner)
    oldUnlockOwner = await ethers.getSigner(oldUnlockOwner)

    // deploy new template
    const PublicLockV13 = await ethers.getContractFactory('PublicLock')
    publicLock = await PublicLockV13.deploy()
    await publicLock.deployed()
    console.log(`PublicLockV13 > deployed at ${publicLock.address}`)
    
    // // impersonate proxyAdmin owner
    const proxyAdminAddress = await getProxyAdminAddress({ network })
    const proxyAdmin = await ethers.getContractAt(['function owner() view returns (address)'], proxyAdminAddress)
    const proxyAdminOwner = await proxyAdmin.owner()
    // console.log(proxyAdminOwner)
    await impersonate(proxyAdminOwner)

    // redeploy new Unlock
    const UnlockModified = await ethers.getContractFactory('Unlock');

    //
    unlockModified = await upgrades.deployProxy(UnlockModified, [signer.address], {
      initializer: 'initialize(address)',
    })
    console.log(`UnlockModified > deployed at ${unlockModified.address}`)

    // create a (v12) lock
    lock = await deployLock({ unlock, isEthers: true })

    // purchase a key
    await purchaseKey(lock, keyOwner.address)

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
      expect(await lock.publicLockVersion()).to.equals(13)
    })
    it('show previous unlock address', async () => {
      expect(await lock.unlockProtocol()).to.equals(unlock.address)
    })
    it('unlock has lock info', async () => {
      const lockBalance = await unlock.locks(lock.address)
      expect(lockBalance.deployed).to.equals(true)
      expect(lockBalance.totalSales.toString()).to.equals((await lock.keyPrice()).toString())
      expect(lockBalance.yieldedDiscountTokens.toNumber()).to.equals(0)
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
    it('lock has updated unlock address', async () => {
      expect(await lock.unlockProtocol()).to.equals(unlockModified.address)
    })
    
    it('new unlock has lock info', async () => {
      const lockBalance = await unlockModified.locks(lock.address)
      expect(lockBalance.deployed).to.equals(true)
      expect(lockBalance.totalSales.toString()).to.equals((await lock.keyPrice()).toString())
      expect(lockBalance.yieldedDiscountTokens.toNumber()).to.equals(0)
    })
  })
  
})