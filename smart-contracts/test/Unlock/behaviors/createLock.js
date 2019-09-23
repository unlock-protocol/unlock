const Web3Utils = require('web3-utils')
const Units = require('ethereumjs-units')
const shouldFail = require('../../helpers/shouldFail')

const PublicLock = artifacts.require('../../PublicLock.sol')

exports.shouldCreateLock = function(accounts) {
  describe('Unlock / behaviors / createLock', function() {
    describe('lock created successfully', function() {
      let transaction
      beforeEach(async function() {
        transaction = await this.unlock.methods
          .createLock(
            60 * 60 * 24 * 30, // expirationDuration: 30 days
            Web3Utils.padLeft(0, 40),
            Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
            100, // maxNumberOfKeys
            'New Lock'
          )
          .send({
            from: accounts[0],
            gas: 6000000,
          })
      })

      it('should have kept track of the Lock inside Unlock with the right balances', async function() {
        let publicLock = await PublicLock.at(
          transaction.events.NewLock.returnValues.newLockAddress
        )
        // This is a bit of a dumb test because when the lock is missing, the value are 0 anyway...
        let results = await this.unlock.methods.locks(publicLock.address).call()
        assert.equal(results.deployed, true)
        assert.equal(results.totalSales, 0)
        assert.equal(results.yieldedDiscountTokens, 0)
      })

      it('should trigger the NewLock event', function() {
        const event = transaction.events.NewLock
        assert(event)
        assert.equal(
          Web3Utils.toChecksumAddress(event.returnValues.lockOwner),
          Web3Utils.toChecksumAddress(accounts[0])
        )
        assert(event.returnValues.newLockAddress)
      })

      it('should have created the lock with the right address for unlock', async function() {
        let publicLock = await PublicLock.at(
          transaction.events.NewLock.returnValues.newLockAddress
        )
        let unlockProtocol = await publicLock.unlockProtocol.call()
        assert.equal(
          Web3Utils.toChecksumAddress(unlockProtocol),
          Web3Utils.toChecksumAddress(this.unlock.address)
        )
      })
    })

    describe('lock creation fails', function() {
      it('should fail if expirationDuration is too large', async function() {
        await shouldFail(
          this.unlock.methods
            .createLock(
              60 * 60 * 24 * 365 * 101, // expirationDuration: 101 years
              Web3Utils.padLeft(0, 40),
              Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
              100, // maxNumberOfKeys
              'Too Big Expiration Lock'
            )
            .send({
              from: accounts[0],
              gas: 4000000,
            })
        )
      })
    })
  })
}
