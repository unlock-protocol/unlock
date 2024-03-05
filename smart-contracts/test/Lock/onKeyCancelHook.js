const { assert } = require('chai')
const { ethers } = require('hardhat')

const { deployLock, ADDRESS_ZERO, purchaseKey } = require('../helpers')
const {
  emitHookUpdatedEvent,
  canNotSetNonContractAddress,
} = require('./behaviors/hooks.js')

describe('Lock / onKeyCancelHook', () => {
  let lock
  let testEventHooks
  let to
  let tokenId
  let events

  before(async () => {
    ;[, to] = await ethers.getSigners()

    lock = await deployLock({ isEthers: true })
    const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
    testEventHooks = await TestEventHooks.deploy()
    const tx = await lock.setEventHooks(
      ADDRESS_ZERO,
      testEventHooks.address,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
    ;({ events } = await tx.wait())
    ;({ tokenId } = await purchaseKey(lock, to.address))
  })

  it('emit the correct event', async () => {
    await emitHookUpdatedEvent({
      events,
      hookName: 'onKeyCancelHook',
      hookAddress: testEventHooks.address,
    })
  })

  it('key cancels should log the hook event', async () => {
    await lock.connect(to).cancelAndRefund(tokenId)
    const { args } = (await testEventHooks.queryFilter('OnKeyCancel')).filter(
      ({ event }) => event === 'OnKeyCancel'
    )[0]
    assert.equal(args.lock, lock.address)
    assert.equal(args.operator, to.address)
    assert.equal(args.to, to.address)
    assert.notEqual(args.refund, 0)
  })

  it('cannot set the hook to a non-contract address', async () => {
    await canNotSetNonContractAddress({ lock, index: 1 })
  })
})
