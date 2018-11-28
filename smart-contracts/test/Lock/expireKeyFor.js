const deployLocks = require('../helpers/deployLocks')
const Unlock = artifacts.require('../Unlock.sol')

let unlock, locks

contract('Lock', (accounts) => {
  before(() => {
    return Unlock.deployed()
      .then(_unlock => {
        unlock = _unlock
        return deployLocks(unlock)
      })
      .then(_locks => {
        locks = _locks
      })
  })

  describe('expireKeyFor', () => {
    it('should fail if not invoked by lock owner', () => {
      return locks['FIRST'].expireKeyFor(accounts[1], {
        from: accounts[8]
      })
        .then(() => {
          assert(false, 'this should have failed')
        })
        .catch(error => {
          assert.equal(error.message, 'VM Exception while processing transaction: revert')
        })
    })

    it('should fail if there is no such key', () => {
      return locks['FIRST'].expireKeyFor(accounts[1], {
        from: accounts[0]
      })
        .then(() => {
          assert(false, 'this should have failed')
        })
        .catch(error => {
          assert.equal(error.message, 'VM Exception while processing transaction: revert Key is not valid')
        })
    })

    it('should fail if the key has already expired', () => {
      return locks['FIRST'].purchaseFor(accounts[2], 'Julien', {
        value: locks['FIRST'].params.keyPrice,
        from: accounts[0]
      }).then(() => {
        return locks['FIRST'].keyExpirationTimestampFor(accounts[2])
      }).then((expirationTimestamp) => {
        const now = Math.floor(new Date().getTime() / 1000)
        assert(expirationTimestamp.toNumber() > now)
        return locks['FIRST'].expireKeyFor(accounts[2], {
          from: accounts[0]
        })
      }).then(() => {
        return locks['FIRST'].expireKeyFor(accounts[2], {
          from: accounts[0]
        })
      }).then(() => {
        assert(false, 'this should have failed')
      })
        .catch(error => {
          assert.equal(error.message, 'VM Exception while processing transaction: revert Key is not valid')
        })
    })

    it('should expire a valid key', () => {
      return locks['FIRST'].purchaseFor(accounts[1], 'Julien', {
        value: locks['FIRST'].params.keyPrice,
        from: accounts[0]
      }).then(() => {
        return locks['FIRST'].keyExpirationTimestampFor(accounts[1])
      }).then((expirationTimestamp) => {
        const now = Math.floor(new Date().getTime() / 1000)
        assert(expirationTimestamp.toNumber() > now)
        return locks['FIRST'].expireKeyFor(accounts[1], {
          from: accounts[0]
        })
      }).then(() => {
        return locks['FIRST'].keyExpirationTimestampFor(accounts[1])
      }).then((expirationTimestamp) => {
        const now = Math.floor(new Date().getTime() / 1000)
        assert(expirationTimestamp.toNumber() <= now)
      })
    })
  })
})
