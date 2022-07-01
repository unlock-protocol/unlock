const { ethers } = require('hardhat')
const { ADDRESS_ZERO, MAX_UINT, deployContracts } = require('../helpers')
const createLockHash = require('../helpers/createLockCalldata')
const { assert } = require('chai')

let unlock
let events

describe('Lock / createLockWithInfiniteKeys', () => {
  before(async () => {
    ;({ unlock } = await deployContracts())
  })

  describe('Create a Lock with infinite keys', () => {
    before(async () => {
      const args = [
        60 * 60 * 24 * 30, // expirationDuration: 30 days
        ADDRESS_ZERO, // token address
        ethers.utils.parseUnits('1', 'ether'), // keyPrice: in wei
        MAX_UINT, // maxNumberOfKeys
        'Infinite Keys Lock', // name
      ]
      const calldata = await createLockHash({ args })
      const tx = await unlock.createUpgradeableLock(calldata)
      ;({ events } = await tx.wait())
    })

    it('should have created the lock with an infinite number of keys', async () => {
      const { args } = events.find(({ event }) => event === 'NewLock')
      const publicLock = await ethers.getContractAt(
        'PublicLock',
        args.newLockAddress
      )
      const maxNumberOfKeys = await publicLock.maxNumberOfKeys()
      assert.equal(
        maxNumberOfKeys.toString(),
        ethers.BigNumber.from(2).pow(256).sub(1).toString()
      )
    })
  })

  describe('Create a Lock with 0 keys', () => {
    before(async () => {
      const args = [
        60 * 60 * 24 * 30, // expirationDuration: 30 days
        ADDRESS_ZERO,
        ethers.utils.parseUnits('1', 'ether'), // keyPrice: in wei
        0, // maxNumberOfKeys
        'Zero-Key Lock',
        // '0x000000000000000000000001',
      ]
      const calldata = await createLockHash({ args })
      const tx = await unlock.createUpgradeableLock(calldata)
      ;({ events } = await tx.wait())
    })

    it('should have created the lock with 0 keys', async () => {
      const { args } = events.find(({ event }) => event === 'NewLock')
      const publicLock = await ethers.getContractAt(
        'PublicLock',
        args.newLockAddress
      )
      const maxNumberOfKeys = await publicLock.maxNumberOfKeys()
      assert.equal(maxNumberOfKeys.toNumber(), 0)
    })
  })
})
