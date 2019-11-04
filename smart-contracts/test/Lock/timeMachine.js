const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')

// const TestTimeMachine = artifacts.require('TestTimeMachine')
const deployLocks = require('../helpers/deployLocks')
// const shouldFail = require('../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock, locks

contract('Lock / timeMachine', accounts => {
  let lock
  const keyPrice = new BigNumber(Units.convert('0.01', 'eth', 'wei'))
  const keyOwner = accounts[1]
  const expirationDuration = new BigNumber(60 * 60 * 24 * 30)
  const tooMuchTime = new BigNumber(60 * 60 * 24 * 42) // 42 days
  let timestampBefore, timestampAfter

  before(async () => {
    unlock = await getProxy(unlockContract)
    // TODO test using an ERC20 priced lock as well
    locks = await deployLocks(unlock, accounts[0])
    lock = locks['FIRST']
    // testTimeMachine = await TestTimeMachine.new()
    // lock = await TestTimeMachine.new()
    // Change the fee to 5%
    await lock.updateTransferFee(500)
    await lock.purchase(0, keyOwner, web3.utils.padLeft(0, 40), [], {
      value: keyPrice.toFixed(),
    })
  })

  describe('modifying the time remaining for a key', () => {
    it('should reduce the time by the amount specified', async () => {
      let hasKey = await lock.getHasValidKey.call(keyOwner)
      assert.equal(hasKey, true)
      timestampBefore = new BigNumber(
        await lock.keyExpirationTimestampFor.call(keyOwner)
      )
      await lock._timeMachine(keyOwner, 1000, false, {
        from: accounts[0],
      }) // decrease the time with "false"
      timestampAfter = new BigNumber(
        await lock.keyExpirationTimestampFor.call(keyOwner)
      )
      assert(timestampAfter.eq(timestampBefore.minus(1000)))
    })

    it('should increase the time by the amount specified', async () => {
      timestampBefore = new BigNumber(
        await lock.keyExpirationTimestampFor.call(keyOwner)
      )
      await lock._timeMachine(keyOwner, 42, true, {
        from: accounts[0],
      }) // increase the time with "true"
      timestampAfter = new BigNumber(
        await lock.keyExpirationTimestampFor.call(keyOwner)
      )
      assert(timestampAfter.eq(timestampBefore.plus(42)))
    })
    it('should prevent overflow & maximise the time remaining', async () => {
      await lock._timeMachine(keyOwner, tooMuchTime, true, {
        from: accounts[0],
      })
      timestampAfter = new BigNumber(
        await lock.keyExpirationTimestampFor.call(keyOwner)
      )
      assert(timestampAfter.lte(expirationDuration.plus(Date.now())))
    })

    it('should prevent underflow & expire the key instead', async () => {
      await lock._timeMachine(keyOwner, tooMuchTime, false, {
        from: accounts[0],
      })
      timestampAfter = new BigNumber(
        await lock.keyExpirationTimestampFor.call(keyOwner)
      )
      assert(timestampAfter.lte(Date.now()))
      assert.equal(await lock.getHasValidKey.call(keyOwner), false)
    })
  })
})
