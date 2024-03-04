const { assert } = require('chai')
const { ethers } = require('hardhat')
const { deployLock, reverts, compareBigNumbers } = require('../helpers')
const { ADDRESS_ZERO, MAX_UINT } = require('@unlock-protocol/hardhat-helpers')
const {
  emitHookUpdatedEvent,
  canNotSetNonContractAddress,
} = require('./behaviors/hooks.js')

const dataField = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('TestData'))

describe('Lock / onKeyPurchaseHook', () => {
  let lock
  let testEventHooks
  let events
  let from, to
  let keyPrice
  let tokenId

  beforeEach(async () => {
    ;[, from, to] = await ethers.getSigners()
    lock = await deployLock({ isEthers: true })

    const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
    testEventHooks = await TestEventHooks.deploy()
    const tx = await lock.setEventHooks(
      testEventHooks.address,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
    console.log({ testEventHooks: testEventHooks.address })
    keyPrice = await lock.keyPrice()
    ;({ events } = await tx.wait())
  })

  it('emit the correct event', async () => {
    await emitHookUpdatedEvent({
      events,
      hookName: 'onKeyPurchaseHook',
      hookAddress: testEventHooks.address,
    })
  })

  it('can block purchases', async () => {
    await reverts(
      lock
        .connect(from)
        .purchase(
          [],
          [to.address],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [dataField],
          {
            value: keyPrice,
          }
        ),
      'PURCHASE_BLOCKED_BY_HOOK'
    )
  })

  describe('when enabled without discount', () => {
    beforeEach(async () => {
      await testEventHooks.configure(true, '0')
      const tx = await lock
        .connect(from)
        .purchase(
          [],
          [to.address],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [dataField],
          {
            value: keyPrice,
          }
        )
      const { events } = await tx.wait()
      ;({ tokenId } = await events[0].args)
    })

    it('key sales should log the hook event', async () => {
      const { args } = (
        await testEventHooks.queryFilter('OnKeyPurchase')
      ).filter(({ event }) => event === 'OnKeyPurchase')[0]
      assert.equal(args.lock, lock.address)
      await compareBigNumbers(args.tokenId, tokenId)
      assert.equal(args.from, from.address)
      assert.equal(args.recipient, to.address)
      assert.equal(args.referrer, ADDRESS_ZERO)
      await compareBigNumbers(args.minKeyPrice, keyPrice)
      await compareBigNumbers(args.pricePaid, keyPrice)
    })

    it('Sanity check: cannot buy at half price', async () => {
      await reverts(
        lock
          .connect(from)
          .purchase(
            [],
            [to.address],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [dataField],
            {
              value: keyPrice.div(2),
            }
          ),
        'INSUFFICIENT_VALUE'
      )
    })

    it('cannot set the hook to a non-contract address', async () => {
      await canNotSetNonContractAddress({ lock, index: 0 })
    })
  })

  describe('with a 50% off discount', () => {
    beforeEach(async () => {
      await testEventHooks.configure(true, keyPrice.div(2))
    })

    it('can estimate the price', async () => {
      const price = await lock.purchasePriceFor(
        to.address,
        ADDRESS_ZERO,
        dataField
      )
      await compareBigNumbers(price, keyPrice.div(2))
    })

    it('can buy at half price', async () => {
      await lock
        .connect(from)
        .purchase(
          [],
          [to.address],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [dataField],
          {
            value: keyPrice.div(2),
          }
        )
    })
  })

  describe('with a huge discount', () => {
    beforeEach(async () => {
      await testEventHooks.configure(true, MAX_UINT)
    })

    it('purchases are now free', async () => {
      await lock
        .connect(from)
        .purchase(
          [],
          [to.address],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [dataField],
          {
            value: '0',
          }
        )
    })

    describe('can still send tips', () => {
      beforeEach(async () => {
        await lock
          .connect(from)
          .purchase(
            [],
            [to.address],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [dataField],
            {
              value: '42',
            }
          )
      })

      it('key sales should log the hook event', async () => {
        const { args } = (
          await testEventHooks.queryFilter('OnKeyPurchase')
        ).filter(({ event }) => event === 'OnKeyPurchase')[0]

        assert.equal(args.lock, lock.address)
        assert.equal(args.from, from.address)
        assert.equal(args.recipient, to.address)
        assert.equal(args.referrer, ADDRESS_ZERO)
        await compareBigNumbers(args.minKeyPrice, '0')
        await compareBigNumbers(args.pricePaid, '42')
      })
    })
  })
})
