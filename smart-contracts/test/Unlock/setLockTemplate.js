const assert = require('assert')
const { ethers } = require('hardhat')
const { deployContracts, reverts } = require('../helpers')

let unlock, PublicLock
let lockTemplate
let signer

describe('Lock / setLockTemplate', () => {
  beforeEach(async () => {
    ;({ unlock } = await deployContracts())

    PublicLock = await ethers.getContractFactory(
      'contracts/PublicLock.sol:PublicLock'
    )
    lockTemplate = await PublicLock.deploy()
    ;[, signer] = await ethers.getSigners()
  })

  it('should set the latest version correctly', async () => {
    // 1
    await unlock.addLockTemplate(await lockTemplate.getAddress(), 1)
    await unlock.setLockTemplate(await lockTemplate.getAddress())
    assert.equal(
      await unlock.publicLockAddress(),
      await lockTemplate.getAddress()
    )
    assert.equal(await unlock.publicLockLatestVersion(), 1)

    // 2
    lockTemplate = await PublicLock.deploy()

    await unlock.addLockTemplate(await lockTemplate.getAddress(), 2)
    await unlock.setLockTemplate(await lockTemplate.getAddress())
    assert.equal(
      await unlock.publicLockAddress(),
      await lockTemplate.getAddress()
    )
    assert.equal(await unlock.publicLockLatestVersion(), 2)
  })

  it('should revert if the template is missing', async () => {
    await reverts(
      unlock.setLockTemplate(await lockTemplate.getAddress()),
      'Unlock__MISSING_LOCK_TEMPLATE'
    )
  })

  it('should revert if called by other than the owner', async () => {
    await reverts(
      unlock.connect(signer).setLockTemplate(await lockTemplate.getAddress()),
      'ONLY_OWNER'
    )
  })

  it('should revert if the lock template address is not a contract', async () => {
    const { address: randomAddress } = await ethers.Wallet.createRandom()
    await reverts(unlock.connect(signer).setLockTemplate(randomAddress))
  })
})
