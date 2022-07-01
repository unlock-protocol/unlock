const TestEventHooks = artifacts.require('TestEventHooks.sol')
const { deployLock, ADDRESS_ZERO, purchaseKey, reverts } = require('../helpers')

let lock
let testEventHooks

contract('Lock / onKeyCancelHook', (accounts) => {
  const to = accounts[2]

  before(async () => {
    lock = await deployLock()
    testEventHooks = await TestEventHooks.new()
    await lock.setEventHooks(
      ADDRESS_ZERO,
      testEventHooks.address,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
    const { tokenId } = await purchaseKey(lock, to)
    await lock.cancelAndRefund(tokenId, { from: to })
  })

  it('key cancels should log the hook event', async () => {
    const log = (await testEventHooks.getPastEvents('OnKeyCancel'))[0]
      .returnValues
    assert.equal(log.lock, lock.address)
    assert.equal(log.operator, to)
    assert.equal(log.to, to)
    assert.notEqual(log.refund, 0)
  })

  it('cannot set the hook to a non-contract address', async () => {
    await reverts(
      lock.setEventHooks(
        ADDRESS_ZERO,
        accounts[1],
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO
      ),
      'INVALID_HOOK(1)'
    )
  })
})
