const { ethers, upgrades, network } = require('hardhat')
const { expect } = require('chai')

const {
  UNLOCK_ADDRESS,
  impersonate,
  // deployContracts,
  deployLock
} = require('../helpers')
const { getProxyAdminAddress } = require('../../helpers/deployments')


let unlock, publicLock, unlockModified, lock

describe(`Unlock migration`, function() {


  before(async function() {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }

    const [signer] = await ethers.getSigners()

    // get original Unlock contract
    unlock = await ethers.getContractAt('Unlock', UNLOCK_ADDRESS)
    // ;({ unlockEthers: unlock } = await deployContracts()) 

    // impersonate old Unlock owner
    let oldUnlockOwner = await unlock.owner()
    await impersonate(oldUnlockOwner)
    oldUnlockOwner = await ethers.getSigner(oldUnlockOwner)

    // deploy new template
    const PublicLockV13 = await ethers.getContractFactory('PublicLock')
    publicLock = await PublicLockV13.deploy()
    await publicLock.deployed()
    console.log(`PublicLockV13 > deployed at ${publicLock.address}`)
    
    // impersonate proxyAdmin owner
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
      useDeployedImplementation: true
    })
    console.log(`UnlockModified > deployed at ${unlockModified.address}`)

    // create a (v12) lock
    lock = await deployLock({ unlock, isEthers: true })

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