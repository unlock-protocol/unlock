const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const Unlock = artifacts.require('../Unlock.sol')

let unlock, locks, keyPriceBefore, transaction

contract('Lock', (accounts) => {
  describe('updateKeyPrice', () => {
    before(async () => {
      unlock = await Unlock.deployed()
      locks = await deployLocks(unlock)
      keyPriceBefore = new BigNumber(await locks['FIRST'].keyPrice())
      assert.equal(keyPriceBefore.toFixed(), 10000000000000000)
      transaction = await locks['FIRST'].updateKeyPrice(Units.convert('0.3', 'eth', 'wei'))
    })

    it('should change the actual keyPrice', async () => {
      const keyPriceAfter = new BigNumber(await locks['FIRST'].keyPrice())
      assert.equal(keyPriceAfter.toFixed(), 300000000000000000)
    })

    it('should trigger an event', () => {
      const event = transaction.logs.find((log) => {
        return log.event === 'PriceChanged'
      })
      assert(event)
      assert.equal(new BigNumber(event.args.keyPrice).toFixed(), 300000000000000000)
    })

    describe('when the sender is not the lock owner', () => {
      let keyPrice, error
      before(async () => {
        keyPrice = await locks['FIRST'].keyPrice()
        try {
          await locks['FIRST'].updateKeyPrice(
            Units.convert('0.3', 'eth', 'wei'),
            {
              from: accounts[3]
            })
        } catch (_error) {
          error = _error
        }
      })

      it('should fail', async () => {
        assert(error)
      })

      it('should leave the price unchanged', async () => {
        const keyPriceAfter = new BigNumber(await locks['FIRST'].keyPrice())
        assert.equal(keyPrice.toFixed(), keyPriceAfter.toFixed())
      })
    })
  })
})
