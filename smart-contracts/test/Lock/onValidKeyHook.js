const { ethers } = require('hardhat')
const { assert } = require('chai')
const { deployLock, ADDRESS_ZERO, reverts, purchaseKey } = require('../helpers')

let lock
let tokenId
let keyOwner
let testEventHooks

describe('Lock / onValidKeyHook', () => {
  before(async () => {
    ;[, keyOwner] = await ethers.getSigners()

    lock = await deployLock()
    ;({ tokenId } = await purchaseKey(lock, keyOwner))

    const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
    testEventHooks = await TestEventHooks.deploy()
    await testEventHooks.deployed()

    await lock.setEventHooks(
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      testEventHooks.address,
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
  })

  it('hasValidKey should returns a custom value', async () => {
    assert.equal(await lock.getHasValidKey(keyOwner.address), true)

    // still returns value
    assert.equal(await lock.getHasValidKey(keyOwner.address), true)

    // expired the key
    await lock.expireAndRefundFor(tokenId, 0)
    assert.equal(await lock.getHasValidKey(keyOwner.address), false)
    assert.equal(await lock.balanceOf(keyOwner.address), 0)

    // set custom value in hook
    await testEventHooks.setSpecialMember(lock.address, keyOwner.address)
    assert.equal(await lock.getHasValidKey(keyOwner.address), true)
  })

  it('cannot set the hook to a non-contract address', async () => {
    await reverts(
      lock.setEventHooks(
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        keyOwner.address,
        ADDRESS_ZERO,
        ADDRESS_ZERO
      ),
      'INVALID_HOOK(2)'
    )
  })
})
