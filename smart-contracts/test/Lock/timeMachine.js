const { assert } = require('chai')
const { ethers } = require('hardhat')
const { ADDRESS_ZERO, reverts, MAX_UINT } = require('../helpers')

const ONE_DAY = 60 * 60 * 24
const expirationDuration = ethers.BigNumber.from(`${ONE_DAY * 30}`)
const tooMuchTime = ethers.BigNumber.from(`${ONE_DAY * 42}`) // 42 days

describe('Lock / timeMachine', () => {
  let timeMachine
  let keyOwner
  let timestampBefore
  let timestampAfter
  let tokenId

  before(async () => {
    ;[, keyOwner] = await ethers.getSigners()

    // init template
    const TimeMachineMock = await ethers.getContractFactory('TimeMachineMock')
    timeMachine = await TimeMachineMock.deploy()

    const { timestamp: now } = await ethers.provider.getBlock('latest')
    timestampBefore = await ethers.BigNumber.from(now).add(expirationDuration)

    const tx = await timeMachine.createNewKey(
      keyOwner.address,
      ADDRESS_ZERO, // beneficiary
      timestampBefore
    )

    const { events } = await tx.wait()

    ;({
      args: { tokenId },
    } = events.find((v) => v.event === 'Transfer'))
  })

  describe('modifying the time remaining for a key', () => {
    it('should reduce the time by the amount specified', async () => {
      assert.equal(await timeMachine.isValidKey(tokenId), true)
      await timeMachine.timeMachine(tokenId, 1000, false) // decrease the time with "false"

      timestampAfter = await timeMachine.keyExpirationTimestampFor(tokenId)
      assert(timestampAfter.eq(timestampBefore.sub(1000)))
    })

    it('should increase the time by the amount specified if the key is not expired', async () => {
      timestampBefore = await timeMachine.keyExpirationTimestampFor(tokenId)
      await timeMachine.timeMachine(tokenId, 42, true) // increase the time with "true"
      timestampAfter = await timeMachine.keyExpirationTimestampFor(tokenId)
      assert(timestampAfter.eq(timestampBefore.add(42)))
    })

    it('should set a new expiration ts from current date/blocktime', async () => {
      // First we substract too much time
      await timeMachine.timeMachine(tokenId, tooMuchTime, false)

      // Then we add back some time (the normal duration)
      const { blockNumber } = await timeMachine.timeMachine(
        tokenId,
        expirationDuration,
        true
      )

      const { timestamp: now } = await ethers.provider.getBlock(blockNumber)
      timestampAfter = await timeMachine.keyExpirationTimestampFor(tokenId)
      assert(
        timestampAfter.eq(ethers.BigNumber.from(now).add(expirationDuration))
      )
    })

    it('should emit the ExpirationChanged event', async () => {
      timestampBefore = await timeMachine.keyExpirationTimestampFor(tokenId)
      const tx = await timeMachine.timeMachine(tokenId, 42, true)

      const { events } = await tx.wait()
      const evt = events.find(({ event }) => event === 'ExpirationChanged')

      timestampAfter = await timeMachine.keyExpirationTimestampFor(tokenId)

      assert(timestampAfter.eq(evt.args.newExpiration))
      assert(timestampBefore.eq(evt.args.prevExpiration))
      assert.equal(evt.args.tokenId.eq(tokenId), true)
    })
  })

  describe('failures', async () => {
    it('should not work for a non-existant key', async () => {
      await reverts(timeMachine.timeMachine(17, 42, true), 'NO_SUCH_KEY')
    })
    it('should prevent overflow work for a non-existant key', async () => {
      const tx = await timeMachine.createNewKey(
        keyOwner.address,
        ADDRESS_ZERO, // beneficiary
        MAX_UINT
      )

      const { events } = await tx.wait()
      const {
        args: { tokenId: tokenIdNonExp },
      } = events.find((v) => v.event === 'Transfer')

      await reverts(
        timeMachine.timeMachine(tokenIdNonExp, 42, true),
        'OUT_OF_RANGE'
      )
    })
  })
})
