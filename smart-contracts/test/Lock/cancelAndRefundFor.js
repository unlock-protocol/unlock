const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')
const Unlock = artifacts.require('../Unlock.sol')
let unlock, locks

contract('Lock', (accounts) => {
  before(async () => {
    unlock = await Unlock.deployed()
    locks = await deployLocks(unlock)
  })

  describe('cancelAndRefundFor', () => {
    let lock
    const keyOwners = [accounts[3], accounts[4]]
    const keyPrice = new BigNumber(Units.convert(0.01, 'eth', 'wei'))
    let lockOwner

    before(async () => {
      lock = locks['SECOND']
      const purchases = keyOwners.map((account) => {
        return lock.purchaseFor(account, Web3Utils.toHex(''), {
          value: keyPrice.toFixed(),
          from: account
        })
      })
      await Promise.all(purchases)
      lockOwner = await lock.owner.call()
    })

    describe('should allow an approved spender to issue a cancelAndRefund', () => {
      before(async () => {
        await lock.approve(keyOwners[0], accounts[1], {
          from: keyOwners[0]
        })
      })

      it('cancelAndRefundFor succeeds', async () => {
        const txObj = await lock.cancelAndRefundFor(keyOwners[0], {
          from: keyOwners[0]
        })
        assert.equal(txObj.logs.length, 2)
      })
    })

    describe('should fail if a non-approved spender attempts to cancelAndRefund', () => {
      it('cancelAndRefundFor fails', async () => {
        await shouldFail(lock.cancelAndRefundFor(keyOwners[0], {
          from: keyOwners[0]
        }), '')
      })
    })
  })
})
