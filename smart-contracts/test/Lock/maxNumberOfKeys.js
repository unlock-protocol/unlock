const { ethers } = require('hardhat')
const { assert } = require('chai')
const deployContracts = require('../fixtures/deploy')
const createLockHash = require('../helpers/createLockCalldata')
const {
  ADDRESS_ZERO,
  purchaseKey,
  purchaseKeys,
  reverts,
} = require('../helpers')

const keyPrice = ethers.utils.parseEther('0.01')

contract('Lock / maxNumberOfKeys', () => {
  let unlock
  let lock

  describe('prevent from buying more keys than defined supply', () => {
    beforeEach(async () => {
      const { unlockEthers: unlockDeployed } = await deployContracts()
      unlock = unlockDeployed
      const [from] = await ethers.getSigners()

      // create a new lock
      const tokenAddress = ADDRESS_ZERO
      const args = [60 * 60 * 24 * 30, tokenAddress, keyPrice, 10, 'Test lock']

      const calldata = await createLockHash({ args, from: from.address })
      const tx = await unlock.createUpgradeableLock(calldata)
      const { events } = await tx.wait()
      const {
        args: { newLockAddress },
      } = events.find(({ event }) => event === 'NewLock')

      const PublicLock = await ethers.getContractFactory('PublicLock')
      lock = PublicLock.attach(newLockAddress)
    })

    it('should prevent from buying more keys from defined', async () => {
      const [, ...buyers] = await ethers.getSigners()

      // buy 10 key
      await purchaseKeys(lock, 10)

      // try to buy another key exceding totalSupply
      await reverts(purchaseKey(lock, buyers[11].address), 'LOCK_SOLD_OUT')

      // increase supply
      await lock.updateLockConfig(
        await lock.expirationDuration(),
        12,
        await lock.maxKeysPerAddress()
      )

      // actually buy the key
      const { to } = await purchaseKey(lock, buyers[11].address)

      assert.equal(to, buyers[11].address)
      assert.equal(await lock.maxNumberOfKeys(), 12)
    })
  })
})
