const { deployLock, reverts, ADDRESS_ZERO } = require('../helpers')
const { assert } = require('chai')

const TestEventHooks = artifacts.require('TestEventHooks.sol')

let lock
let testEventHooks

contract('Lock / onKeyPurchaseHook', (accounts) => {
  const lockManager = accounts[0]
  const to = accounts[2]
  const keyManager = accounts[2]

  beforeEach(async () => {
    lock = await deployLock()
    testEventHooks = await TestEventHooks.new()
    await lock.setEventHooks(
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      testEventHooks.address
    )
  })

  describe('grantKey', () => {
    it('can easily check if key is granted or purchase', async () => {
      const tx = await lock.grantKeys([to], [6200], [keyManager])

      const { args: argsGrantKeys } = tx.logs.find(
        ({ event }) => event === 'Transfer'
      )
      const { tokenId } = argsGrantKeys

      // get event from hook contract
      const { args } = (await testEventHooks.getPastEvents('OnKeyGranted'))[0]
      assert.equal(args.tokenId.toNumber(), tokenId.toNumber())
      assert.equal(args.to, to)
      assert.equal(args.from, lockManager)
      assert.equal(args.keyManager, keyManager)
      assert.equal(args.expiration, 6200)
    })
  })

  it('cannot set the hook to a non-contract address', async () => {
    await reverts(
      lock.setEventHooks(
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        accounts[1]
      ),
      'INVALID_HOOK(6)'
    )
  })
})
