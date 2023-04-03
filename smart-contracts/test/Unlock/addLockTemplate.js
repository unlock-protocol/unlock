const { expect } = require('chai')
const { ethers, upgrades } = require('hardhat')
const { reverts, ADDRESS_ZERO } = require('../helpers')

contract('PublicLock template versions', () => {
  let unlock
  let publicLock
  let publicLockUpgraded

  beforeEach(async () => {
    const Unlock = await ethers.getContractFactory('Unlock')
    const [unlockOwner] = await ethers.getSigners()
    unlock = await upgrades.deployProxy(Unlock, [unlockOwner.address], {
      initializer: 'initialize(address)'
    })
    await unlock.deployed()

    const PublicLock = await ethers.getContractFactory(
      'contracts/PublicLock.sol:PublicLock'
    )
    publicLock = await PublicLock.deploy()
    await publicLock.deployed()

    // deploy new implementation
    const PublicLockUpgraded = await ethers.getContractFactory(
      'TestPublicLockUpgraded'
    )
    publicLockUpgraded = await PublicLockUpgraded.deploy()
    await publicLockUpgraded.deployed()
  })

  it('Should forbid non-owner to add impl', async () => {
    const [, , , signer] = await ethers.getSigners()
    await reverts(
      unlock.connect(signer).addLockTemplate(publicLock.address, 3),
      'ONLY_OWNER'
    )
  })

  it('Should store version number properly', async () => {
    const tx1 = await unlock.addLockTemplate(publicLock.address, 1)
    await tx1.wait()
    expect(await unlock.publicLockVersions(publicLock.address)).to.equals(1)

    const tx2 = await unlock.addLockTemplate(publicLockUpgraded.address, 2)
    await tx2.wait()
    expect(await unlock.publicLockVersions(publicLockUpgraded.address)).to.equals(2)
  })

  it('should revert if the template was already initialized', async () => {
    await unlock.addLockTemplate(publicLock.address, 1)
    const [, , , signer] = await ethers.getSigners()
    await reverts(
      publicLock.initialize(signer.address, 0, ADDRESS_ZERO, 0, 0, '')
    )
  })
  
  it('should revert if the template is not a contract', async () => {
    // jump versions is allowed
    const { address: randomAddress } = await ethers.Wallet.createRandom()
    await reverts(
      unlock.addLockTemplate(randomAddress, 532),
      'non-contract'
    )
  })

  it('Should store publicLockImpls properly', async () => {
    const tx1 = await unlock.addLockTemplate(publicLock.address, 1)
    await tx1.wait()
    expect(await unlock.publicLockImpls(1)).to.equals(publicLock.address)
    expect(await unlock.publicLockVersions(publicLock.address)).to.equals(1)

    // make sure everything is stored properly
    const tx2 = await unlock.addLockTemplate(publicLockUpgraded.address, 2)
    await tx2.wait()
    expect(await unlock.publicLockImpls(2)).to.equals(
      publicLockUpgraded.address
    )
    expect(
      await unlock.publicLockVersions(publicLockUpgraded.address)
    ).to.equals(2)
  })

  it('should fire an event when template is added', async () => {
    const tx = await unlock.addLockTemplate(publicLock.address, 3)
    const { events } = await tx.wait()
    const evt = events.find((v) => v.event === 'UnlockTemplateAdded')
    const { impl } = evt.args
    expect(impl).to.equals(publicLock.address)
    expect(await unlock.publicLockImpls(3)).to.equals(publicLock.address)
    expect(await unlock.publicLockVersions(publicLock.address)).to.equals(3)
  })
})
