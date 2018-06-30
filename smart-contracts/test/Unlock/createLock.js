const Units = require('ethereumjs-units')
const Lock = artifacts.require('../Lock.sol')
const Unlock = artifacts.require('../Unlock.sol')

let unlock

contract('Lock', (accounts) => {
  before(() => {
    return Unlock.deployed()
      .then(_unlock => {
        unlock = _unlock
        return unlock
      })
  })

  describe('createLock', () => {
    let transaction
    before(() => {
      return unlock.createLock(
        0, // keyReleaseMechanism: KeyReleaseMechanisms.Public
        60 * 60 * 24 * 30, // expirationDuration: 30 days
        Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
        100 // maxNumberOfKeys
        , {
          from: accounts[0]
        }).then((tx) => {
        transaction = tx
      })
    })

    it('should have kept track of the Lock inside Unlock with the right balances', () => {
      let lock = Lock.at(transaction.logs[0].args.newLockAddress)
      // This is a bit of a dumb test because when the lock is missing, the value are 0 anyway...
      return unlock.locks(lock.address).then(([deployed, totalSales, yieldedDiscountTokens]) => {
        assert(deployed)
        assert.equal(totalSales.toNumber(), 0)
        assert.equal(yieldedDiscountTokens.toNumber(), 0)
      })
    })

    it('should trigger the NewLock event', () => {
      const event = transaction.logs.find((log) => {
        return log.event === 'NewLock'
      })
      assert(event)
      assert.equal(event.args.lockOwner, accounts[0])
      assert(event.args.newLockAddress)
    })

    it('should have created the lock with the right address for unlock', () => {
      let lock = Lock.at(transaction.logs[0].args.newLockAddress)
      return lock.unlockProtocol()
        .then((unlockProtocol) => {
          assert.equal(unlockProtocol, unlock.address)
        })
    })
  })
})
