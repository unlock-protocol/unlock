const { ethers } = require('hardhat')
const { getProxyAddress } = require('../../helpers/deployments')
const createLockHash = require('../helpers/createLockCalldata')

const keyPrice = ethers.utils.parseEther('0.01')

contract('Lock / mimick owner()', () => {
  let unlock
  let lock
  let deployer

  beforeEach(async () => {
    const chainId = 31337
    const unlockAddress = getProxyAddress(chainId, 'Unlock')

    // parse unlock
    ;[deployer] = await ethers.getSigners()

    const Unlock = await ethers.getContractFactory('Unlock')
    unlock = Unlock.attach(unlockAddress)

    // create a new lock
    const tokenAddress = web3.utils.padLeft(0, 40)
    const args = [60 * 30, tokenAddress, keyPrice, 10, 'Test lock']

    const calldata = await createLockHash({ args, from: deployer.address })
    const tx = await unlock.createUpgradeableLock(calldata)
    const { events } = await tx.wait()
    const {
      args: { newLockAddress },
    } = events.find(({ event }) => event === 'NewLock')

    const PublicLock = await ethers.getContractFactory('PublicLock')
    lock = PublicLock.attach(newLockAddress)
  })

  /*
  describe('owner()', () => {
    it('default should be set as deployer', async () => {
      assert.equal(await lock.owner(), deployer.address)
    })
  })
  */

  describe('isOwner()', () => {
    it('should return true when address is a Lock Manager', async () => {
      // check default
      assert.equal(await lock.isOwner(deployer.address), true)
      assert.equal(await lock.isLockManager(deployer.address), true)

      // check random address
      const wallet = await ethers.Wallet.createRandom()
      const tx = await lock.connect(deployer).addLockManager(wallet.address)
      await tx.wait()
      assert.equal(await lock.isOwner(wallet.address), true)
    })
    it('should return false when another address is not a lock Manager', async () => {
      // check default
      const wallet = await ethers.Wallet.createRandom()
      assert.equal(await lock.isOwner(wallet.address), false)

      // check random address
      const tx = await lock.connect(deployer).addLockManager(wallet.address)
      await tx.wait()
      assert.equal(await lock.isOwner(wallet.address), true)

      // remove lock manager
      lock.connect(deployer).renounceLockManager()
      assert.equal(await lock.isOwner(deployer.address), false)
    })
  })
})
