const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')
simulateTime = require('../helpers/simulateTime')
revertTime = require('../helpers/revertTime')
const Unlock = artifacts.require('../Unlock.sol')

let unlock, locks

contract('Lock', (accounts) => {
  const account = accounts[1]
  let lock;
  
  before(async () => {
    unlock = await Unlock.deployed()
    locks = await deployLocks(unlock)
    lock = locks['FIRST'];
  })

  describe('getHasValidKey', () => {
    it('should be false before purchasing a key', async () => {
      const isValid = await lock.getHasValidKey.call(account)
      assert.equal(isValid, false)
    })

    describe('after purchase', () => {
      before(async () => {
        await lock.purchaseFor(account, Web3Utils.toHex('Julien'), {
          value: Units.convert('0.01', 'eth', 'wei')
        })
      })

      it('should be true', async () => {
        const isValid = await lock.getHasValidKey.call(account)
        assert.equal(isValid, true)
      })

      describe('after time has expired', () => {
        before(async () => {
          await simulateTime(new BigNumber(await lock.expirationDuration.call()).plus(1).toNumber())
        })

        after(async () => {
          await revertTime()
        })

        it('should be false', async () => {
          const isValid = await lock.getHasValidKey.call(account)
          assert.equal(isValid, false)
        })
      })
  
      describe('after transfering a previously purchased key', () => {
        before(async () => {
          await lock.transferFrom(account, accounts[5], await lock.getTokenIdFor(account), { from: account })
        })

        it('should be false', async () => {
          const isValid = await lock.getHasValidKey.call(account)
          assert.equal(isValid, false)
        })
      })
    })
  })
})
