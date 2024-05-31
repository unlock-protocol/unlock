const assert = require('assert')
const { ethers } = require('hardhat')
const { reverts } = require('../helpers')

const deployContracts = require('../fixtures/deploy')
const {
  ADDRESS_ZERO,
  createLockCalldata,
  getEvent,
} = require('@unlock-protocol/hardhat-helpers')

const keyPrice = ethers.parseEther('0.01')

describe('Lock / mimick owner()', () => {
  let lock
  let deployer

  beforeEach(async () => {
    ;[deployer] = await ethers.getSigners()

    const { unlock } = await deployContracts()

    // create a new lock
    const tokenAddress = ADDRESS_ZERO
    const args = [60 * 30, tokenAddress, keyPrice, 10, 'Test lock']

    const calldata = await createLockCalldata({
      args,
      from: await deployer.getAddress(),
    })
    const tx = await unlock.createUpgradeableLock(calldata)
    const receipt = await tx.wait()
    const {
      args: { newLockAddress },
    } = await getEvent(receipt, 'NewLock')

    const PublicLock = await ethers.getContractFactory(
      'contracts/PublicLock.sol:PublicLock'
    )
    lock = PublicLock.attach(newLockAddress)
  })

  describe('owner()', () => {
    it('default should be set as deployer', async () => {
      assert.equal(await lock.owner(), await deployer.getAddress())
    })
  })

  describe('setOwner()', () => {
    it('should set any address as owner', async () => {
      const wallet = await ethers.Wallet.createRandom()
      const tx = await lock
        .connect(deployer)
        .setOwner(await wallet.getAddress())
      await tx.wait()
      assert.equal(await lock.owner(), await wallet.getAddress())
    })
    it('should revert on address zero', async () => {
      await reverts(
        lock.connect(deployer).setOwner(ADDRESS_ZERO),
        'OWNER_CANT_BE_ADDRESS_ZERO'
      )
    })
    it('should revert if not lock manager', async () => {
      const [, notManager, anotherAddress] = await ethers.getSigners()
      await reverts(
        lock.connect(notManager).setOwner(await notManager.getAddress()),
        'ONLY_LOCK_MANAGER'
      )
      await reverts(
        lock.connect(notManager).setOwner(await anotherAddress.getAddress()),
        'ONLY_LOCK_MANAGER'
      )
    })
  })

  describe('isOwner()', () => {
    it('should return true when owner address is passed', async () => {
      // check default
      assert.equal(await lock.isOwner(await deployer.getAddress()), true)
      // check random address
      const wallet = await ethers.Wallet.createRandom()
      const tx = await lock
        .connect(deployer)
        .setOwner(await wallet.getAddress())
      await tx.wait()
      assert.equal(await lock.isOwner(await wallet.getAddress()), true)
    })
    it('should return false when another address is passed', async () => {
      const wallet = await ethers.Wallet.createRandom()
      // check default
      assert.equal(await lock.isOwner(await wallet.getAddress()), false)

      // check random address
      const tx = await lock
        .connect(deployer)
        .setOwner(await wallet.getAddress())
      await tx.wait()
      assert.equal(await lock.isOwner(await wallet.getAddress()), true)
      assert.equal(await lock.isOwner(await deployer.getAddress()), false)
    })
  })

  describe('OwnershipTransferred event', () => {
    it('should be emitted when new owner is set', async () => {
      const wallet = await ethers.Wallet.createRandom()
      const tx = await lock
        .connect(deployer)
        .setOwner(await wallet.getAddress())
      const receipt = await tx.wait()
      const {
        args: { previousOwner, newOwner },
      } = await getEvent(receipt, 'OwnershipTransferred')
      assert.equal(previousOwner, await deployer.getAddress())
      assert.equal(newOwner, await wallet.getAddress())
      assert.equal(await lock.owner(), await wallet.getAddress())
    })
  })
})
