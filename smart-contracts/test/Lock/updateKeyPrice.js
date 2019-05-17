const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../helpers/proxy')

let unlock, locks, keyPriceBefore, transaction

contract('Lock / updateKeyPrice', accounts => {
  before(async () => {
    unlock = await getUnlockProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    keyPriceBefore = new BigNumber(await locks['FIRST'].keyPrice.call())
    assert.equal(keyPriceBefore.toFixed(), 10000000000000000)
    transaction = await locks['FIRST'].updateKeyPrice(
      Units.convert('0.3', 'eth', 'wei')
    )
  })

  it('should change the actual keyPrice', async () => {
    const keyPriceAfter = new BigNumber(await locks['FIRST'].keyPrice.call())
    assert.equal(keyPriceAfter.toFixed(), 300000000000000000)
  })

  it('should trigger an event', () => {
    const event = transaction.logs.find(log => {
      return log.event === 'PriceChanged'
    })
    assert(event)
    assert.equal(
      new BigNumber(event.args.keyPrice).toFixed(),
      300000000000000000
    )
  })

  it('should allow changing price to 0', async () => {
    await locks['FIRST'].updateKeyPrice(0)
    const keyPriceAfter = new BigNumber(await locks['FIRST'].keyPrice.call())
    assert.equal(keyPriceAfter.toFixed(), 0)
  })

  describe('when the sender is not the lock owner', () => {
    let keyPrice

    before(async () => {
      keyPrice = new BigNumber(await locks['FIRST'].keyPrice.call())
      await shouldFail(
        locks['FIRST'].updateKeyPrice(Units.convert('0.3', 'eth', 'wei'), {
          from: accounts[3],
        }),
        ''
      )
    })

    it('should leave the price unchanged', async () => {
      const keyPriceAfter = new BigNumber(await locks['FIRST'].keyPrice.call())
      assert.equal(keyPrice.toFixed(), keyPriceAfter.toFixed())
    })
  })
})
