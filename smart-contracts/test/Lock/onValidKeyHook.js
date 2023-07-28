const { deployLock, ADDRESS_ZERO, reverts, purchaseKey } = require('../helpers')

const TestEventHooks = artifacts.require('TestEventHooks.sol')

let lock
let tokenId
let testEventHooks
let tx

contract('Lock / onValidKeyHook', (accounts) => {
  const keyOwner = accounts[1]

  before(async () => {
    lock = await deployLock()
    ;({ tokenId } = await purchaseKey(lock, keyOwner))
  })

  it('hasValidKey should returns a custom value', async () => {
    assert.equal(await lock.getHasValidKey(keyOwner), true)
    testEventHooks = await TestEventHooks.new()
    tx = await lock.setEventHooks(
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      testEventHooks.address,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
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
    const { args } = tx.logs.find(({ event }) => event === 'EventHooksUpdated')
    assert.equal(args.onKeyPurchaseHook, ADDRESS_ZERO)
    assert.equal(args.onKeyCancelHook, ADDRESS_ZERO)
    assert.equal(args.onValidKeyHook, testEventHooks.address)
    assert.equal(args.onTokenURIHook, ADDRESS_ZERO)
    assert.equal(args.onKeyTransferHook, ADDRESS_ZERO)
    assert.equal(args.onKeyExtendHook, ADDRESS_ZERO)
    assert.equal(args.onKeyGrantHook, ADDRESS_ZERO)
  })

  it('cannot set the hook to a non-contract address', async () => {
    await reverts(
      lock.setEventHooks(
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        accounts[3],
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO
      ),
      'INVALID_HOOK(2)'
    )
  })
})
