const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')

const shouldFail = require('../../helpers/shouldFail')
const PublicLock = artifacts.require('../../PublicLock.sol')

exports.shouldCreateLock = function (accounts) {
  describe('createLock', function () {
    describe('lock created successfully', function () {
      let transaction
      beforeEach(async function () {
        transaction = await this.unlock.createLock(
          60 * 60 * 24 * 30, // expirationDuration: 30 days
          Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
          100 // maxNumberOfKeys
          , {
            from: accounts[0],
            gas: 4000000
          })
      })

      it('should have kept track of the Lock inside Unlock with the right balances', async function () {
        let publicLock = await PublicLock.at(transaction.logs[0].args.newLockAddress)
        // This is a bit of a dumb test because when the lock is missing, the value are 0 anyway...
        let [deployed, totalSales, yieldedDiscountTokens] = await this.unlock.locks(publicLock.address)
        totalSales = new BigNumber(totalSales)
        yieldedDiscountTokens = new BigNumber(yieldedDiscountTokens)
        assert(deployed)
        assert.equal(totalSales.toFixed(), 0)
        assert.equal(yieldedDiscountTokens.toFixed(), 0)
      })

      it('should trigger the NewLock event', function () {
        const event = transaction.logs.find((log) => {
          return log.event === 'NewLock'
        })
        assert(event)
        assert.equal(event.args.lockOwner, accounts[0])
        assert(event.args.newLockAddress)
      })

      it('should have created the lock with the right address for unlock', async function () {
        let publicLock = await PublicLock.at(transaction.logs[0].args.newLockAddress)
        let unlockProtocol = await publicLock.unlockProtocol()
        assert.equal(unlockProtocol, this.unlock.address)
      })
    })

    describe('lock creation fails', function () {
      it('should fail if expirationDuration is too large', async function () {
        await shouldFail(this.unlock.createLock(
          60 * 60 * 24 * 365 * 101, // expirationDuration: 101 years
          Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
          100 // maxNumberOfKeys
          , {
            from: accounts[0],
            gas: 4000000
          }), 'MAX_EXPIRATION_100_YEARS')
      })
    })
  })
}
