const { ethers } = require('hardhat')
const createLockHash = require('../../helpers/createLockCalldata')
const { ADDRESS_ZERO } = require('../../helpers/constants')

const PublicLock = artifacts.require('PublicLock')

exports.shouldCreateLock = (options) => {
  describe('Unlock / behaviors / createLock', () => {
    let unlock
    let accounts
    let evt

    beforeEach(async () => {
      ;({ unlock, accounts } = options)
    })

    describe('lock created successfully', () => {
      let transaction
      beforeEach(async () => {
        const args = [
          60 * 60 * 24 * 30, // expirationDuration: 30 days
          ADDRESS_ZERO,
          ethers.utils.parseUnits('1', 'ether'), // keyPrice: in wei
          100, // maxNumberOfKeys
          'New Lock',
        ]
        const calldata = await createLockHash({ args, from: accounts[0] })
        transaction = await unlock.createUpgradeableLock(calldata, {
          gas: 6000000,
        })
        evt = transaction.logs.find((v) => v.event === 'NewLock')
      })

      it('should have kept track of the Lock inside Unlock with the right balances', async () => {
        let publicLock = await PublicLock.at(evt.args.newLockAddress)
        // This is a bit of a dumb test because when the lock is missing, the value are 0 anyway...
        let results = await unlock.locks(publicLock.address)
        assert.equal(results.totalSales, 0)
        assert.equal(results.yieldedDiscountTokens, 0)
      })

      it('should trigger the NewLock event', () => {
        const event = transaction.logs.find((v) => v.event === 'NewLock')
        assert(event)
        assert.equal(
          ethers.utils.getAddress(event.args.lockOwner),
          ethers.utils.getAddress(accounts[0])
        )
        assert(event.args.newLockAddress)
      })

      it('should have created the lock with the right address for unlock', async () => {
        let publicLock = await PublicLock.at(evt.args.newLockAddress)
        let unlockProtocol = await publicLock.unlockProtocol()
        assert.equal(
          ethers.utils.getAddress(unlockProtocol),
          ethers.utils.getAddress(unlock.address)
        )
      })
    })
  })
}
