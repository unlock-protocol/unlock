const { deployLock, ADDRESS_ZERO } = require('../helpers')
const { assert } = require('chai')

const { ethers } = require('hardhat')
const {
  emitHookUpdatedEvent,
  canNotSetNonContractAddress,
} = require('./behaviors/hooks.js')

let lock
let testEventHooks

describe('Lock / onKeyGrantHook', () => {
  let lockManager
  let to
  let keyManager
  let events

  before(async () => {
    ;[{ address: lockManager }, { address: to }, { address: keyManager }] =
      await ethers.getSigners()
    lock = await deployLock({ isEthers: true })
    const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
    testEventHooks = await TestEventHooks.deploy()
    const tx = await lock.setEventHooks(
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      testEventHooks.address
    )
    ;({ events } = await tx.wait())
  })

  it('emit the correct event', async () => {
    await emitHookUpdatedEvent({
      events,
      hookName: 'onKeyGrantHook',
      hookAddress: testEventHooks.address,
    })
  })

  describe('grantKey', () => {
    it('can easily check if key is granted or purchase', async () => {
      const tx = await lock.grantKeys([to], [6200], [keyManager])
      const { events } = await tx.wait()

      const { args: argsGrantKeys } = events.find(
        ({ event }) => event === 'Transfer'
      )
      const { tokenId } = argsGrantKeys

      // get event from hook contract
      const { args } = (
        await testEventHooks.queryFilter('OnKeyGranted')
      ).filter(({ event }) => event === 'OnKeyGranted')[0]
      assert.equal(args.tokenId.toNumber(), tokenId.toNumber())
      assert.equal(args.to, to)
      assert.equal(args.from, lockManager)
      assert.equal(args.keyManager, keyManager)
      assert.equal(args.expiration, 6200)
    })
  })

  it('cannot set the hook to a non-contract address', async () => {
    await canNotSetNonContractAddress({ lock, index: 6 })
  })
})
