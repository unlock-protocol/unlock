const assert = require('assert')
const { ethers, upgrades } = require('hardhat')
const { reverts, ADDRESS_ZERO } = require('../helpers')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

describe('PublicLock template versions', () => {
  let unlock
  let publicLock
  let publicLockUpgraded

  beforeEach(async () => {
    const Unlock = await ethers.getContractFactory('Unlock')
    const [unlockOwner] = await ethers.getSigners()
    unlock = await upgrades.deployProxy(
      Unlock,
      [await unlockOwner.getAddress()],
      {
        initializer: 'initialize(address)',
      }
    )

    const PublicLock = await ethers.getContractFactory(
      'contracts/PublicLock.sol:PublicLock'
    )
    publicLock = await PublicLock.deploy()

    // deploy new implementation
    const PublicLockUpgraded = await ethers.getContractFactory(
      'TestPublicLockUpgraded'
    )
    publicLockUpgraded = await PublicLockUpgraded.deploy()
  })

  it('Should forbid non-owner to add impl', async () => {
    const [, , , signer] = await ethers.getSigners()
    await reverts(
      unlock.connect(signer).addLockTemplate(await publicLock.getAddress(), 3),
      'ONLY_OWNER'
    )
  })

  it('Should store version number properly', async () => {
    const tx1 = await unlock.addLockTemplate(await publicLock.getAddress(), 1)
    await tx1.wait()
    assert.equal(
      await unlock.publicLockVersions(await publicLock.getAddress()),
      1n
    )

    const tx2 = await unlock.addLockTemplate(
      await publicLockUpgraded.getAddress(),
      2
    )
    await tx2.wait()
    assert.equal(
      await unlock.publicLockVersions(await publicLockUpgraded.getAddress()),
      2n
    )
  })

  it('should revert if the template was already initialized', async () => {
    await unlock.addLockTemplate(await publicLock.getAddress(), 1)
    const [, , , signer] = await ethers.getSigners()
    await reverts(
      publicLock.initialize(
        await signer.getAddress(),
        0,
        ADDRESS_ZERO,
        0,
        0,
        ''
      )
    )
  })

  it('should revert if the template is not a contract', async () => {
    // jump versions is allowed
    const { address: randomAddress } = await ethers.Wallet.createRandom()
    await reverts(unlock.addLockTemplate(randomAddress, 532), 'non-contract')
  })

  it('Should store publicLockImpls properly', async () => {
    const tx1 = await unlock.addLockTemplate(await publicLock.getAddress(), 1)
    await tx1.wait()
    assert.equal(await unlock.publicLockImpls(1), await publicLock.getAddress())
    assert.equal(
      await unlock.publicLockVersions(await publicLock.getAddress()),
      1n
    )

    // make sure everything is stored properly
    const tx2 = await unlock.addLockTemplate(
      await publicLockUpgraded.getAddress(),
      2
    )
    await tx2.wait()
    assert.equal(
      await unlock.publicLockImpls(2),
      await publicLockUpgraded.getAddress()
    )
    assert.equal(
      await unlock.publicLockVersions(await publicLockUpgraded.getAddress()),
      2n
    )
  })

  it('should fire an event when template is added', async () => {
    const tx = await unlock.addLockTemplate(await publicLock.getAddress(), 3)
    const receipt = await tx.wait()
    const evt = await getEvent(receipt, 'UnlockTemplateAdded')
    const { impl } = evt.args
    assert.equal(impl, await publicLock.getAddress())
    assert.equal(await unlock.publicLockImpls(3), await publicLock.getAddress())
    assert.equal(
      await unlock.publicLockVersions(await publicLock.getAddress()),
      3n
    )
  })
})
