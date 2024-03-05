const { assert } = require('chai')
const { ethers } = require('hardhat')

const {
  ADDRESS_ZERO,
  createLockCalldata,
} = require('@unlock-protocol/hardhat-helpers')

const deployContracts = require('../fixtures/deploy')
const { compareBigNumbers } = require('../helpers')

describe('Unlock / UnlockProxy', () => {
  let unlock
  let unlockOwner
  before(async () => {
    ;[unlockOwner] = await ethers.getSigners()

    // get proxy from hardhat deployment
    ;({ unlock } = await deployContracts())

    // deploy template
    const PublicLock = await ethers.getContractFactory(
      'contracts/PublicLock.sol:PublicLock'
    )
    const template = await PublicLock.deploy()
    await template.deployed()

    await unlock.addLockTemplate(
      template.address,
      (await unlock.publicLockLatestVersion()) + 1
    )
    await unlock.setLockTemplate(template.address)
  })

  describe('initialization', () => {
    it('should have an owner', async () => {
      const owner = await unlock.owner()
      assert.equal(owner, unlockOwner.address)
    })

    it('should have initialized grossNetworkProduct', async () => {
      compareBigNumbers(await unlock.grossNetworkProduct(), 0)
    })

    it('should have initialized totalDiscountGranted', async () => {
      assert.equal(await unlock.totalDiscountGranted(), 0)
    })
  })

  describe('lock created successfully', () => {
    let newLockArgs

    beforeEach(async () => {
      const args = [
        60 * 60 * 24 * 30, // expirationDuration: 30 days
        ADDRESS_ZERO,
        ethers.utils.parseUnits('1', 'ether').toString(), // keyPrice: in wei
        100, // maxNumberOfKeys
        'New Lock',
      ]
      const calldata = await createLockCalldata({
        args,
        from: unlockOwner.address,
      })
      const tx = await unlock.createUpgradeableLock(calldata)
      const { events } = await tx.wait()
      ;({ args: newLockArgs } = events.find((v) => v.event === 'NewLock'))
    })

    it('should have kept track of the Lock inside Unlock with the right balances', async () => {
      let publicLock = await ethers.getContractAt(
        'contracts/PublicLock.sol:PublicLock',
        newLockArgs.newLockAddress
      )
      // This is a bit of a dumb test because when the lock is missing, the value are 0 anyway...
      let results = await unlock.locks(publicLock.address)
      assert.equal(results.totalSales, 0)
      assert.equal(results.yieldedDiscountTokens, 0)
    })

    it('should trigger the NewLock event', () => {
      assert.equal(
        ethers.utils.getAddress(newLockArgs.lockOwner),
        ethers.utils.getAddress(unlockOwner.address)
      )
      assert(newLockArgs.newLockAddress)
    })

    it('should have created the lock with the right address for unlock', async () => {
      let publicLock = await ethers.getContractAt(
        'contracts/PublicLock.sol:PublicLock',
        newLockArgs.newLockAddress
      )
      let unlockProtocol = await publicLock.unlockProtocol()
      assert.equal(
        ethers.utils.getAddress(unlockProtocol),
        ethers.utils.getAddress(unlock.address)
      )
    })
  })
})
