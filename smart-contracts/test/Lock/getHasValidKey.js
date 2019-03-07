const Units = require('ethereumjs-units')

const deployLocks = require('../helpers/deployLocks')
const Unlock = artifacts.require('../Unlock.sol')

let unlock, locks

contract('Lock / getHasValidKey', (accounts) => {
  const account = accounts[1]
  let lock

  before(async () => {
    unlock = await Unlock.deployed()
    locks = await deployLocks(unlock, accounts[0])
    lock = locks['FIRST']
  })

  it('should be false before purchasing a key', async () => {
    const isValid = await lock.getHasValidKey.call(account)
    assert.equal(isValid, false)
  })

  describe('after purchase', () => {
    before(async () => {
      await lock.purchaseFor(account, {
        value: Units.convert('0.01', 'eth', 'wei')
      })
    })

    it('should be true', async () => {
      const isValid = await lock.getHasValidKey.call(account)
      assert.equal(isValid, true)
    })

    describe('after transfering a previously purchased key', () => {
      before(async () => {
        await lock.transferFrom(account, accounts[5], await lock.getTokenIdFor.call(account), { from: account })
      })

      it('should be false', async () => {
        const isValid = await lock.getHasValidKey.call(account)
        assert.equal(isValid, false)
      })
    })
  })
})
