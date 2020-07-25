const { reverts } = require('truffle-assertions')

const PublicLock = artifacts.require('PublicLock.sol')

exports.shouldCreateLock = (options) => {
  describe('Unlock / behaviors / createLock', () => {
    let unlock
    let accounts

    beforeEach(async () => {
      ;({ unlock, accounts } = options)
    })

    describe('lock created successfully', () => {
      let transaction
      beforeEach(async () => {
        transaction = await unlock.methods
          .createLock(
            60 * 60 * 24 * 30, // expirationDuration: 30 days
            web3.utils.padLeft(0, 40),
            web3.utils.toWei('1', 'ether'), // keyPrice: in wei
            100, // maxNumberOfKeys
            'New Lock',
            '0x000000000000000000000000'
          )
          .send({
            from: accounts[0],
            gas: 6000000,
          })
      })

      it('should have kept track of the Lock inside Unlock with the right balances', async () => {
        let publicLock = await PublicLock.at(
          transaction.events.NewLock.returnValues.newLockAddress
        )
        // This is a bit of a dumb test because when the lock is missing, the value are 0 anyway...
        let results = await unlock.methods.locks(publicLock.address).call()
        assert.equal(results.deployed, true)
        assert.equal(results.totalSales, 0)
        assert.equal(results.yieldedDiscountTokens, 0)
      })

      it('should trigger the NewLock event', () => {
        const event = transaction.events.NewLock
        assert(event)
        assert.equal(
          web3.utils.toChecksumAddress(event.returnValues.lockOwner),
          web3.utils.toChecksumAddress(accounts[0])
        )
        assert(event.returnValues.newLockAddress)
      })

      it('should have created the lock with the right address for unlock', async () => {
        let publicLock = await PublicLock.at(
          transaction.events.NewLock.returnValues.newLockAddress
        )
        let unlockProtocol = await publicLock.unlockProtocol.call()
        assert.equal(
          web3.utils.toChecksumAddress(unlockProtocol),
          web3.utils.toChecksumAddress(unlock.address)
        )
      })
    })

    describe('lock creation fails', () => {
      it('should fail if expirationDuration is too large', async () => {
        await reverts(
          unlock.methods
            .createLock(
              60 * 60 * 24 * 365 * 101, // expirationDuration: 101 years
              web3.utils.padLeft(0, 40),
              web3.utils.toWei('1', 'ether'), // keyPrice: in wei
              100, // maxNumberOfKeys
              'Too Big Expiration Lock',
              '0x000000000000000000000000'
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
