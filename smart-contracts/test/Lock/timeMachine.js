const assert = require('assert')
const { ethers } = require('hardhat')
const { ADDRESS_ZERO, reverts, MAX_UINT } = require('../helpers')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')
const ONE_DAY = 60 * 60 * 24
const expirationDuration = BigInt(`${ONE_DAY * 30}`)
const tooMuchTime = BigInt(`${ONE_DAY * 42}`) // 42 days

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
    timestampBefore = (await BigInt(now)) + expirationDuration

    const tx = await timeMachine.createNewKey(
      await keyOwner.getAddress(),
      ADDRESS_ZERO, // beneficiary
      timestampBefore
    )

    const receipt = await tx.wait()

    ;({
      args: { tokenId },
    } = await getEvent(receipt, 'Transfer'))
  })

  describe('modifying the time remaining for a key', () => {
    it('should reduce the time by the amount specified', async () => {
      assert.equal(await timeMachine.isValidKey(tokenId), true)
      await timeMachine.timeMachine(tokenId, 1000, false) // decrease the time with "false"

      timestampAfter = await timeMachine.keyExpirationTimestampFor(tokenId)
      assert(timestampAfter == timestampBefore - 1000n)
    })

    it('should increase the time by the amount specified if the key is not expired', async () => {
      timestampBefore = await timeMachine.keyExpirationTimestampFor(tokenId)
      await timeMachine.timeMachine(tokenId, 42, true) // increase the time with "true"
      timestampAfter = await timeMachine.keyExpirationTimestampFor(tokenId)
      assert(timestampAfter == timestampBefore + 42n)
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
      assert(timestampAfter == BigInt(now) + expirationDuration)
    })

    it('should emit the ExpirationChanged event', async () => {
      timestampBefore = await timeMachine.keyExpirationTimestampFor(tokenId)
      const tx = await timeMachine.timeMachine(tokenId, 42, true)

      const receipt = await tx.wait()
      const evt = await getEvent(receipt, 'ExpirationChanged')

      timestampAfter = await timeMachine.keyExpirationTimestampFor(tokenId)

      assert(timestampAfter == evt.args.newExpiration)
      assert(timestampBefore == evt.args.prevExpiration)
      assert.equal(evt.args.tokenId == tokenId, true)
    })
  })

  describe('failures', async () => {
    it('should not work for a non-existant key', async () => {
      await reverts(timeMachine.timeMachine(17, 42, true), 'NO_SUCH_KEY')
    })
    it('should prevent overflow work for a non-existant key', async () => {
      const tx = await timeMachine.createNewKey(
        await keyOwner.getAddress(),
        ADDRESS_ZERO, // beneficiary
        MAX_UINT
      )

      const receipt = await tx.wait()
      const {
        args: { tokenId: tokenIdNonExp },
      } = await getEvent(receipt, 'Transfer')

      await reverts(
        timeMachine.timeMachine(tokenIdNonExp, 42, true),
        'OUT_OF_RANGE'
      )
    })
  })
})
