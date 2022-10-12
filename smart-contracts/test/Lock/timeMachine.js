const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')

const TimeMachineMock = artifacts.require('TimeMachineMock')

const { ADDRESS_ZERO, reverts } = require('../helpers')

contract('Lock / timeMachine', (accounts) => {
  let timeMachine
  const keyOwner = accounts[2]
  const expirationDuration = new BigNumber(60 * 60 * 24 * 30)
  const tooMuchTime = new BigNumber(60 * 60 * 24 * 42) // 42 days
  let timestampBefore
  let timestampAfter
  let tokenId
  let tx

  before(async () => {
    // init template
    timeMachine = await TimeMachineMock.new()

    timestampBefore = new BigNumber(
      (await ethers.provider.getBlock('latest')).timestamp
    ).plus(expirationDuration)

    tx = await timeMachine.createNewKey(
      keyOwner,
      ADDRESS_ZERO, // beneficiary
      timestampBefore
    )

    const { args } = tx.logs.find((v) => v.event === 'Transfer')
    tokenId = args.tokenId
  })

  describe('modifying the time remaining for a key', () => {
    it('should reduce the time by the amount specified', async () => {
      assert.equal(await timeMachine.isValidKey(tokenId), true)
      await timeMachine.timeMachine(tokenId, 1000, false, {
        from: accounts[0],
      }) // decrease the time with "false"

      timestampAfter = new BigNumber(
        await timeMachine.keyExpirationTimestampFor(tokenId)
      )
      assert(timestampAfter.eq(timestampBefore.minus(1000)))
    })

    it('should increase the time by the amount specified if the key is not expired', async () => {
      timestampBefore = new BigNumber(
        await timeMachine.keyExpirationTimestampFor(tokenId)
      )
      await timeMachine.timeMachine(tokenId, 42, true, {
        from: accounts[0],
      }) // increase the time with "true"
      timestampAfter = new BigNumber(
        await timeMachine.keyExpirationTimestampFor(tokenId)
      )
      assert(timestampAfter.eq(timestampBefore.plus(42)))
    })

    it('should set a new expiration ts from current date/blocktime', async () => {
      // First we substract too much time
      tx = await timeMachine.timeMachine(tokenId, tooMuchTime, false, {
        from: accounts[0],
      })

      // Then we add back some time (the normal duration)
      tx = await timeMachine.timeMachine(tokenId, expirationDuration, true, {
        from: accounts[0],
      })

      const { timestamp: now } = await ethers.provider.getBlock(
        tx.receipt.blockNumber
      )

      timestampAfter = new BigNumber(
        await timeMachine.keyExpirationTimestampFor(tokenId)
      )
      assert(timestampAfter.eq(new BigNumber(now).plus(expirationDuration)))
    })

    it('should emit the ExpirationChanged event', async () => {
      assert.equal(tx.logs[0].event, 'ExpirationChanged')
      timestampBefore = new BigNumber(
        await timeMachine.keyExpirationTimestampFor(tokenId)
      )
      assert.equal(
        tx.logs[0].args.newExpiration.toString(),
        timestampBefore.toString()
      )

      const tx2 = await timeMachine.timeMachine(tokenId, 42, true, {
        from: accounts[0],
      }) // increase the time with "true"
      timestampAfter = new BigNumber(
        await timeMachine.keyExpirationTimestampFor(tokenId)
      )
      assert(timestampAfter.eq(tx2.logs[0].args.newExpiration))
      assert.equal(tx2.logs[0].args.amount, 42)
      assert.equal(tx2.logs[0].args.timeAdded, true)
      assert.equal(tx2.logs[0].args.tokenId.eq(tokenId), true)
    })
  })

  describe('failures', async () => {
    it('should not work for a non-existant key', async () => {
      await reverts(
        timeMachine.timeMachine(17, 42, true, { from: accounts[3] }),
        'NO_SUCH_KEY'
      )
    })
  })
})
