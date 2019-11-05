const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')

const unlockContract = artifacts.require('../Unlock.sol')
const TimeMachineMock = artifacts.require('TimeMachineMock')
const getProxy = require('../helpers/proxy')

let unlock

contract('Lock / timeMachine', accounts => {
  let lock
  const lockOwner = accounts[1]
  const keyPrice = new BigNumber(Units.convert('0.01', 'eth', 'wei'))
  const keyOwner = accounts[2]
  const expirationDuration = new BigNumber(60 * 60 * 24 * 30)
  const tooMuchTime = new BigNumber(60 * 60 * 24 * 42) // 42 days
  let timestampBefore, timestampAfter, lockAddress

  before(async () => {
    let salt = 42
    unlock = await getProxy(unlockContract)
    await unlock.configUnlock((await TimeMachineMock.new()).address, '', '')
    let tx = await unlock.createLock(
      new BigNumber(60 * 60 * 24 * 30), // 30 days
      web3.utils.padLeft(0, 40),
      new BigNumber(Units.convert(0.01, 'eth', 'wei')),
      11,
      'TimeMachineMockLock',
      `0x${salt.toString(16)}`,
      { from: lockOwner }
    )
    lockAddress = tx.logs[1].args.newLockAddress

    lock = await TimeMachineMock.at(lockAddress)
    // Change the fee to 5%
    await lock.updateTransferFee(500, { from: lockOwner })
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
      await lock.timeMachine(keyOwner, 1000, false, {
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
      await lock.timeMachine(keyOwner, 42, true, {
        from: accounts[0],
      }) // increase the time with "true"
      timestampAfter = new BigNumber(
        await lock.keyExpirationTimestampFor.call(keyOwner)
      )
      assert(timestampAfter.eq(timestampBefore.plus(42)))
    })
    it('should prevent overflow & maximise the time remaining', async () => {
      await lock.timeMachine(keyOwner, tooMuchTime, true, {
        from: accounts[0],
      })
      timestampAfter = new BigNumber(
        await lock.keyExpirationTimestampFor.call(keyOwner)
      )
      assert(timestampAfter.lte(expirationDuration.plus(Date.now())))
    })
  })
})
