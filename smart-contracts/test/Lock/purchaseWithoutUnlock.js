const assert = require('assert')
const { ethers, upgrades } = require('hardhat')
console.log(upgrades)
const {
  createLockCalldata,
  getEvent,
} = require('@unlock-protocol/hardhat-helpers')
const { ADDRESS_ZERO, deployContracts } = require('../helpers')

const keyPrice = ethers.parseEther('0.01')

const breakUnlock = async (unlockAddress) => {
  // deploy a random contract to break Unlock implementation
  const BrokenUnlock = await ethers.getContractFactory('KeyManager')
  await upgrades.upgradeProxy(unlockAddress, BrokenUnlock, {
    unsafeSkipStorageCheck: true,
  })
}

const fixUnlock = async (unlockAddress) => {
  const Unlock = await ethers.getContractFactory('Unlock')
  await upgrades.upgradeProxy(unlockAddress, Unlock, {
    unsafeSkipStorageCheck: true,
  })
}

describe('Lock / purchaseWithoutUnlock', () => {
  let unlock
  let lock

  // setup proxy admin etc
  before(async () => {
    ;({ unlock } = await deployContracts())
  })

  describe('purchase with a lock while Unlock is broken', () => {
    beforeEach(async () => {
      const [from] = await ethers.getSigners()
      // create a new lock
      const tokenAddress = ADDRESS_ZERO
      const args = [60 * 60 * 24 * 30, tokenAddress, keyPrice, 100, 'Test lock']

      const calldata = await createLockCalldata({
        args,
        from: await from.getAddress(),
      })
      const tx = await unlock.createUpgradeableLock(calldata)
      const receipt = await tx.wait()
      const {
        args: { newLockAddress },
      } = await getEvent(receipt, 'NewLock')

      lock = await ethers.getContractAt(
        'contracts/PublicLock.sol:PublicLock',
        newLockAddress
      )

      // break Unlock
      await breakUnlock(await unlock.getAddress())
    })

    afterEach(async () => {
      // restore previous state after each test
      await fixUnlock(await unlock.getAddress())
    })

    it('should fire an event to notify Unlock has failed', async () => {
      const [, buyer] = await ethers.getSigners()
      const tx = await lock
        .connect(buyer)
        .purchase(
          [keyPrice],
          [await buyer.getAddress()],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          ['0x'],
          {
            value: keyPrice,
          }
        )
      const receipt = await tx.wait()

      // make sure transfer happened
      const transfer = await getEvent(receipt, 'Transfer')
      assert.equal(transfer.args.to, await buyer.getAddress())
      assert.equal(transfer.args.tokenId == 1, true)

      const missing = await getEvent(receipt, 'UnlockCallFailed')
      assert.equal(missing.args.unlockAddress, await unlock.getAddress())
      assert.equal(missing.args.lockAddress, await lock.getAddress())
    })

    it('should fail when discount hook is set', async () => {
      const [, buyer] = await ethers.getSigners()
      const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
      const testEventHooks = await TestEventHooks.deploy()

      // set on purchase hook
      await lock.setEventHooks(
        await testEventHooks.getAddress(),
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO
      )
      // 50% discount
      await testEventHooks.configure(true, keyPrice / 2n)
      const tx = await lock
        .connect(buyer)
        .purchase(
          [keyPrice],
          [await buyer.getAddress()],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          ['0x'],
          {
            value: keyPrice,
          }
        )

      // make sure transfer happened
      const receipt = await tx.wait()
      const transfer = await getEvent(receipt, 'Transfer')
      assert.equal(transfer.args.to, await buyer.getAddress())
      assert.equal(transfer.args.tokenId == 1, true)

      // event has been fired
      const missing = await getEvent(receipt, 'UnlockCallFailed')
      assert.equal(missing.args.unlockAddress, await unlock.getAddress())
      assert.equal(missing.args.lockAddress, await lock.getAddress())
    })
  })
})
