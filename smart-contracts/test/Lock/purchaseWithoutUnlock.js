const { ethers } = require('hardhat')
const ProxyAdmin = require('@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json')
const { admin } = require('../../.openzeppelin/unknown-31337.json')
const { getProxyAddress } = require('../../helpers/deployments')
const createLockHash = require('../helpers/createLockCalldata')
const Locks = require('../fixtures/locks')

const keyPrice = web3.utils.toWei('0.01', 'ether')

const breakUnlock = async (unlockAddress) => {
  // set a broken Unlock contract implementation
  const BrokenUnlock = await ethers.getContractFactory('TestEventHooks')
  const broken = await BrokenUnlock.deploy()
  await broken.deployTransaction.wait()

  // make upgrade
  const [unlockOwner] = await ethers.getSigners()
  const proxyAdmin = await ethers.getContractAt(
    ProxyAdmin.abi,
    admin.address,
    unlockOwner
  )

  const upgradeTx = await proxyAdmin.upgrade(unlockAddress, broken.address)
  await upgradeTx.wait()
}

contract('Lock / purchaseWithoutUnlock', () => {
  let unlock
  let lock

  describe('purchase with a lock while Unlock is broken', () => {
    beforeEach(async () => {
      const chainId = 31337
      const unlockAddress = getProxyAddress(chainId, 'Unlock')

      const [from] = await ethers.getSigners()
      const Unlock = await ethers.getContractFactory('Unlock')
      unlock = Unlock.attach(unlockAddress)

      const lockName = 'FIRST'
      const tokenAddress = web3.utils.padLeft(0, 40)
      const args = [
        Locks[lockName].expirationDuration.toFixed(),
        tokenAddress,
        Locks[lockName].keyPrice.toFixed(),
        Locks[lockName].maxNumberOfKeys.toFixed(),
        Locks[lockName].lockName,
      ]

      const calldata = await createLockHash({ args, from: from.address })
      const tx = await unlock.createLock(calldata)
      const { events } = await tx.wait()
      const {
        args: { newLockAddress },
      } = events.find(({ event }) => event === 'NewLock')

      const PublicLock = await ethers.getContractFactory('PublicLock')
      lock = PublicLock.attach(newLockAddress)

      // break it
      await breakUnlock(unlock.address)
    })

    it('should fire an event to notify Unlock has failed', async () => {
      const [, buyer] = await ethers.getSigners()
      const tx = await lock
        .connect(buyer)
        .purchase(
          keyPrice.toString(),
          buyer.address,
          web3.utils.padLeft(0, 40),
          [],
          {
            value: keyPrice.toString(),
          }
        )
      const { events } = await tx.wait()

      // make sure transfer happened
      const transfer = events.find(({ event }) => event === 'Transfer')
      assert.equal(transfer.args.to, buyer.address)
      assert.equal(transfer.args.tokenId.eq(1), true)

      const missing = events.find(({ event }) => event === 'MissingUnlock')
      assert.equal(missing.args.unlockAddress, unlock.address)
      assert.equal(missing.args.lockAddress, lock.address)
    })

    it('should fail twice when discount hook is set', async () => {
      const [, buyer] = await ethers.getSigners()

      const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
      const testEventHooks = await TestEventHooks.deploy()
      await testEventHooks.deployTransaction.wait()

      // set on purchase hook
      await lock.setEventHooks(
        testEventHooks.address,
        web3.utils.padLeft(0, 40)
      )

      // 50% discount
      await testEventHooks.configure(true, keyPrice.div(2).toFixed())

      const tx = await lock
        .connect(buyer)
        .purchase(
          keyPrice.toString(),
          buyer.address,
          web3.utils.padLeft(0, 40),
          [],
          {
            value: keyPrice.toString(),
          }
        )
      const { events } = await tx.wait()

      // make sure transfer happened
      const transfer = events.find(({ event }) => event === 'Transfer')
      assert.equal(transfer.args.to, buyer.address)
      assert.equal(transfer.args.tokenId.eq(1), true)

      const missing = events.find(({ event }) => event === 'MissingUnlock')
      assert.equal(missing.args.unlockAddress, unlock.address)
      assert.equal(missing.args.lockAddress, lock.address)

      assert.equal(
        events.filter(({ event }) => event === 'MissingUnlock').length,
        2
      )
    })
  })
})
