const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')
const Unlock = artifacts.require('../Unlock.sol')

let unlock, locks

contract('Lock', (accounts) => {
  before(() => {
    return Unlock.deployed()
      .then(_unlock => {
        unlock = _unlock
        return deployLocks(unlock, accounts[0])
      })
      .then(_locks => {
        locks = _locks
      })
  })

  describe('getOwnersByPage', () => {
    describe('when there are 0 key owners', () => {
      it('should return an error', async () => {
        await shouldFail(locks['FIRST'].getOwnersByPage.call(0, 2, { from: accounts[5] }), 'NO_OUTSTANDING_KEYS')
      })
    })

    describe('when there are less owners than the page size', () => {
      it('should return all of the key owners', async () => {
        await locks['FIRST'].purchaseFor(accounts[1], Web3Utils.toHex('alpha'), { value: Units.convert('0.01', 'eth', 'wei') })
        let result = await locks['FIRST'].getOwnersByPage.call(0, 2, { from: accounts[0] })
        assert.equal(result.length, 1)
        assert.include(result, accounts[1])
      })
    })

    describe('when there are more owners than the page size', () => {
      it('return page size number of key owners', async () => {
        await locks['FIRST'].purchaseFor(accounts[1], Web3Utils.toHex('alpha'), {
          value: Units.convert('0.01', 'eth', 'wei')
        })

        await locks['FIRST'].purchaseFor(accounts[2], Web3Utils.toHex('beta'), {
          value: Units.convert('0.01', 'eth', 'wei')
        })

        await locks['FIRST'].purchaseFor(accounts[3], Web3Utils.toHex('gamma'), {
          value: Units.convert('0.01', 'eth', 'wei')
        })

        let result = await locks['FIRST'].getOwnersByPage.call(0, 2, { from: accounts[0] })
        assert.equal(result.length, 2)
        assert.include(result, accounts[1])
        assert.include(result, accounts[2])
      })
    })

    describe('when requesting a secondary page', () => {
      it('return page size number of key owners', async () => {
        await locks['FIRST'].purchaseFor(accounts[1], Web3Utils.toHex('alpha'), {
          value: Units.convert('0.01', 'eth', 'wei')
        })

        await locks['FIRST'].purchaseFor(accounts[2], Web3Utils.toHex('beta'), {
          value: Units.convert('0.01', 'eth', 'wei')
        })

        await locks['FIRST'].purchaseFor(accounts[3], Web3Utils.toHex('gamma'), {
          value: Units.convert('0.01', 'eth', 'wei')
        })

        let result = await locks['FIRST'].getOwnersByPage.call(1, 2, { from: accounts[0] })
        assert.equal(result.length, 1)
        assert.equal(accounts[3], result[0])
      })
    })
  })
})
