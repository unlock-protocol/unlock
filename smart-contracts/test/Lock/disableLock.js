const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')
const Unlock = artifacts.require('../Unlock.sol')

let unlock, locks, ID

contract('Lock', accounts => {
  let lock

  before(async () => {
    unlock = await Unlock.deployed()
    locks = await deployLocks(unlock)
    lock = locks['FIRST']
    await lock.purchaseFor(accounts[1], Web3Utils.toHex('Julien'), {
      value: Units.convert('0.01', 'eth', 'wei')
    })
    ID = new BigNumber(await lock.getTokenIdFor(accounts[1])).toFixed()
  })

  describe('disableLock', () => {
    it('should fail if called by the wrong account', async () => {
      await shouldFail(lock.disableLock({ from: accounts[1] }), '')
    })

    it('should fail if called before the lock is disabled', async () => {
      await shouldFail(
        lock.destroyLock(),
        'DISABLE_FIRST'
      )
    })

    describe('when the lock has been disabled', () => {
      let txObj, event
      before(async () => {
        txObj = await lock.disableLock({ from: accounts[0] })
        event = txObj.logs[0]
      })

      it('should trigger the Disable event', () => {
        assert.equal(event.event, 'Disable')
      })

      it('should fail if called while lock is disabled', async () => {
        await shouldFail(
          lock.disableLock(),
          'LOCK_DEPRECATED'
        )
      })

      it('should fail if a user tries to purchase a key', async () => {
        await shouldFail(
          lock.purchaseFor(accounts[1], Web3Utils.toHex('Julien'), {
            value: Units.convert('0.01', 'eth', 'wei')
          }),
          'LOCK_DEPRECATED'
        )
      })

      it('should fail if a user tries to purchase a key with a referral', async () => {
        await shouldFail(
          lock.purchaseForFrom(
            accounts[1],
            accounts[3],
            Web3Utils.toHex('Julien'),
            {
              value: Units.convert('0.01', 'eth', 'wei')
            }
          ),
          'LOCK_DEPRECATED'
        )
      })

      it('should fail if a user tries to transfer a key', async () => {
        await shouldFail(
          lock.transferFrom(accounts[1], accounts[3], ID, {
            from: accounts[1],
            value: Units.convert('0.01', 'eth', 'wei')
          }),
          'LOCK_DEPRECATED'
        )
      })

      it('should fail if a key owner tries to a approve an address', async () => {
        await shouldFail(
          lock.approve(accounts[3], ID, {
            from: accounts[1]
          }),
          'LOCK_DEPRECATED'
        )
      })

      it('should still allow access to non-payable contract functions', async () => {
        let HasValidKey = await lock.getHasValidKey.call(accounts[1])
        assert.equal(HasValidKey, true)
      })
    })
  })
})
