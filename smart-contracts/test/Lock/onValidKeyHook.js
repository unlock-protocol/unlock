const { assert } = require('chai')
const { deployLock, ADDRESS_ZERO, purchaseKey } = require('../helpers')

const { ethers } = require('hardhat')
const {
  emitHookUpdatedEvent,
  canNotSetNonContractAddress,
} = require('./behaviors/hooks.js')

describe('Lock / onValidKeyHook', () => {
  let lock
  let tokenId
  let testEventHooks
  let events
  let keyOwner

  before(async () => {
    ;[, { address: keyOwner }] = await ethers.getSigners()
    lock = await deployLock({ isEthers: true })
    ;({ tokenId } = await purchaseKey(lock, keyOwner))
    assert.equal(await lock.getHasValidKey(keyOwner), true)
    const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
    testEventHooks = await TestEventHooks.deploy()
    const tx = await lock.setEventHooks(
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      testEventHooks.address,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
    ;({ events } = await tx.wait())
  })

  it('hasValidKey should returns a custom value', async () => {
    // still returns value
    assert.equal(await lock.getHasValidKey(keyOwner), true)

    // expired the key
    await lock.expireAndRefundFor(tokenId, 0)
    assert.equal(await lock.getHasValidKey(keyOwner), false)
    assert.equal(await lock.balanceOf(keyOwner), 0)

    // set custom value in hook
    await testEventHooks.setSpecialMember(lock.address, keyOwner)
    assert.equal(await lock.getHasValidKey(keyOwner), true)
  })

  it('emit the correct event', async () => {
    await emitHookUpdatedEvent({
      events,
      hookName: 'onValidKeyHook',
      hookAddress: testEventHooks.address,
    })
  })

  it('cannot set the hook to a non-contract address', async () => {
    await canNotSetNonContractAddress({ lock, index: 2 })
  })
})
