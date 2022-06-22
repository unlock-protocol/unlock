const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')
const { ADDRESS_ZERO, MAX_UINT } = require('../helpers/constants')
const PublicLock = artifacts.require('PublicLock')
const getContractInstance = require('../helpers/truffle-artifacts')
const createLockHash = require('../helpers/createLockCalldata')

const unlockContract = artifacts.require('Unlock')

let unlock

contract('Lock / createLockWithInfiniteKeys', () => {
  before(async () => {
    unlock = await getContractInstance(unlockContract)
  })

  describe('Create a Lock with infinite keys', () => {
    let transaction
    before(async () => {
      const args = [
        60 * 60 * 24 * 30, // expirationDuration: 30 days
        ADDRESS_ZERO, // token address
        ethers.utils.parseUnits('1', 'ether'), // keyPrice: in wei
        MAX_UINT, // maxNumberOfKeys
        'Infinite Keys Lock', // name
      ]
      const calldata = await createLockHash({ args })
      transaction = await unlock.createUpgradeableLock(calldata)
    })

    it('should have created the lock with an infinite number of keys', async () => {
      let publicLock = await PublicLock.at(
        transaction.logs[0].args.newLockAddress
      )
      const maxNumberOfKeys = new BigNumber(await publicLock.maxNumberOfKeys())
      assert.equal(
        maxNumberOfKeys.toFixed(),
        new BigNumber(2).pow(256).minus(1).toFixed()
      )
    })
  })

  describe('Create a Lock with 0 keys', () => {
    let transaction
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
      transaction = await unlock.createUpgradeableLock(calldata)
    })

    it('should have created the lock with 0 keys', async () => {
      let publicLock = await PublicLock.at(
        transaction.logs[0].args.newLockAddress
      )
      const maxNumberOfKeys = new BigNumber(await publicLock.maxNumberOfKeys())
      assert.equal(maxNumberOfKeys.toFixed(), 0)
    })
  })
})
