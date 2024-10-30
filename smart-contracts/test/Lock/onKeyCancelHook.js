const assert = require('assert')
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
  let receipt

  before(async () => {
    ;[, to] = await ethers.getSigners()

    lock = await deployLock({ isEthers: true })
    const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
    testEventHooks = await TestEventHooks.deploy()
    const tx = await lock.setEventHooks(
      ADDRESS_ZERO,
      await testEventHooks.getAddress(),
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
    receipt = await tx.wait()
    ;({ tokenId } = await purchaseKey(lock, await to.getAddress()))
  })

  it('emit the correct event', async () => {
    await emitHookUpdatedEvent({
      receipt,
      hookName: 'onKeyCancelHook',
      hookAddress: await testEventHooks.getAddress(),
    })
  })

  it('key cancels should log the hook event', async () => {
    await lock.connect(to).cancelAndRefund(tokenId)
    const { args } = (await testEventHooks.queryFilter('OnKeyCancel')).filter(
      ({ fragment }) => fragment.name === 'OnKeyCancel'
    )[0]
    assert.equal(args.lock, await lock.getAddress())
    assert.equal(args.operator, await to.getAddress())
    assert.equal(args.to, await to.getAddress())
    assert.notEqual(args.refund, 0)
  })

  it('cannot set the hook to a non-contract address', async () => {
    await canNotSetNonContractAddress({ lock, index: 1 })
  })
})
