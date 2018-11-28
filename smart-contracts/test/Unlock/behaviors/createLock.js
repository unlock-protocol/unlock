const Units = require('ethereumjs-units')
const PublicLock = artifacts.require('../../PublicLock.sol')

exports.shouldCreateLock = function (accounts) {
  describe('createLock', function () {
    let transaction
    beforeEach(async function () {
      transaction = await this.unlock.createLock(
        60 * 60 * 24 * 30, // expirationDuration: 30 days
        Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
        100 // maxNumberOfKeys
        , {
          from: accounts[0]
        })
    })

    it('should have kept track of the Lock inside Unlock with the right balances', async function () {
      let publicLock = PublicLock.at(transaction.logs[0].args.newLockAddress)
      // This is a bit of a dumb test because when the lock is missing, the value are 0 anyway...
      let [deployed, totalSales, yieldedDiscountTokens] = await this.unlock.locks(publicLock.address)
      assert(deployed)
      assert.equal(totalSales.toNumber(), 0)
      assert.equal(yieldedDiscountTokens.toNumber(), 0)
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
      let publicLock = PublicLock.at(transaction.logs[0].args.newLockAddress)
      let unlockProtocol = await publicLock.unlockProtocol()
      assert.equal(unlockProtocol, this.unlock.address)
    })
  })
}
