const { assert } = require('chai')
const { ethers } = require('hardhat')

const { deployLock, ADDRESS_ZERO, purchaseKey, reverts } = require('../helpers')

let lock
let to
let testEventHooks

describe('Lock / onKeyCancelHook', () => {
  before(async () => {
    ;[, to] = await ethers.getSigners()
    lock = await deployLock()

    const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
    testEventHooks = await TestEventHooks.deploy()
    await testEventHooks.deployed()

    await lock.setEventHooks(
      ADDRESS_ZERO,
      testEventHooks.address,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
    const { tokenId } = await purchaseKey(lock, to)
    await lock.connect(to).cancelAndRefund(tokenId)
  })

  it('key cancels should log the hook event', async () => {
    const [event] = await testEventHooks.queryFilter('OnKeyCancel')
    const { args } = event
    assert.equal(args.lock, lock.address)
    assert.equal(args.operator, to.address)
    assert.equal(args.to, to.address)
    assert.notEqual(args.refund, 0)
  })

  it('cannot set the hook to a non-contract address', async () => {
    await reverts(
      lock.setEventHooks(
        ADDRESS_ZERO,
        to.address,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO
      ),
      'INVALID_HOOK(1)'
    )
  })
})
