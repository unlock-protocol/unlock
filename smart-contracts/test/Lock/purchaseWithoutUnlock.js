const { assert } = require('chai')
const { ethers } = require('hardhat')
const ProxyAdmin = require('@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json')

const {
  createLockCalldata,
  getEvent,
} = require('@unlock-protocol/hardhat-helpers')
const {
  ADDRESS_ZERO,
  deployContracts,
  getProxyAdminAddress,
} = require('../helpers')

const keyPrice = ethers.parseEther('0.01')
let pastImpl
let brokenImpl
let proxyAdmin

const breakUnlock = async (unlockAddress) => {
  const upgradeTx = await proxyAdmin.upgrade(unlockAddress, brokenImpl)
  await upgradeTx.wait()
}

const fixUnlock = async (unlockAddress) => {
  const upgradeTx = await proxyAdmin.upgrade(unlockAddress, pastImpl)
  await upgradeTx.wait()
}

describe('Lock / purchaseWithoutUnlock', () => {
  let unlock
  let lock

  // setup proxy admin etc
  before(async () => {
    ;({ unlock } = await deployContracts())

    // deploy a random contract to break Unlock implementation
    const BrokenUnlock = await ethers.getContractFactory('LockSerializer')
    const broken = await BrokenUnlock.deploy()
    await broken.deployTransaction.wait()
    brokenImpl = broken.address

    // get proxyAdmin address
    const proxyAdminAddress = await getProxyAdminAddress(unlock.address)

    // upgrade proxy to broken contract
    const [unlockOwner] = await ethers.getSigners()
    proxyAdmin = await ethers.getContractAt(
      ProxyAdmin.abi,
      proxyAdminAddress,
      unlockOwner
    )
  })

  describe('purchase with a lock while Unlock is broken', () => {
    beforeEach(async () => {
      const [from] = await ethers.getSigners()
      // create a new lock
      const tokenAddress = ADDRESS_ZERO
      const args = [
        60 * 60 * 24 * 30,
        tokenAddress,
        keyPrice.toString(),
        100,
        'Test lock',
      ]

      const calldata = await createLockCalldata({ args, from: from.address })
      const tx = await unlock.createUpgradeableLock(calldata)
      const receipt = await tx.wait()
      const {
        args: { newLockAddress },
      } = await getEvent(receipt, 'NewLock')

      const PublicLock = await ethers.getContractFactory('PublicLock')
      lock = PublicLock.attach(newLockAddress)

      // store past impl address
      pastImpl = await proxyAdmin.getProxyImplementation(unlock.address)

      // break Unlock
      await breakUnlock(unlock.address)
    })

    afterEach(async () => {
      // restore previous state after each test
      await fixUnlock(unlock.address)
    })

    it('should fire an event to notify Unlock has failed', async () => {
      const [, buyer] = await ethers.getSigners()
      const tx = await lock
        .connect(buyer)
        .purchase(
          [keyPrice.toString()],
          [buyer.address],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: keyPrice.toString(),
          }
        )
      const receipt = await tx.wait()

      // make sure transfer happened
      const transfer = await getEvent(receipt, 'Transfer')
      assert.equal(transfer.args.to, buyer.address)
      assert.equal(transfer.args.tokenId.eq(1), true)

      const missing = await getEvent(receipt, 'UnlockCallFailed')
      assert.equal(missing.args.unlockAddress, unlock.address)
      assert.equal(missing.args.lockAddress, lock.address)
    })

    it('should fail when discount hook is set', async () => {
      const [, buyer] = await ethers.getSigners()
      const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
      const testEventHooks = await TestEventHooks.deploy()
      await testEventHooks.deployTransaction.wait()

      // set on purchase hook
      await lock.setEventHooks(
        testEventHooks.address,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO
      )
      // 50% discount
      await testEventHooks.configure(true, keyPrice / 2)
      const tx = await lock
        .connect(buyer)
        .purchase(
          [keyPrice],
          [buyer.address],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: keyPrice,
          }
        )

      // make sure transfer happened
      const receipt = await tx.wait()
      const transfer = await getEvent(receipt, 'Transfer')
      assert.equal(transfer.args.to, buyer.address)
      assert.equal(transfer.args.tokenId.eq(1), true)

      // event has been fired
      const missing = await getEvent(receipt, 'UnlockCallFailed')
      assert.equal(missing.args.unlockAddress, unlock.address)
      assert.equal(missing.args.lockAddress, lock.address)
    })
  })
})
