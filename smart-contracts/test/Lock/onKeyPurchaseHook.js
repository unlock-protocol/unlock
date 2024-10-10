const assert = require('assert')
const { ethers } = require('hardhat')
const { deployLock, reverts, compareBigNumbers } = require('../helpers')
const {
  ADDRESS_ZERO,
  getEvent,
  MAX_UINT,
} = require('@unlock-protocol/hardhat-helpers')
const {
  emitHookUpdatedEvent,
  canNotSetNonContractAddress,
} = require('./behaviors/hooks.js')

const dataField = ethers.hexlify(ethers.toUtf8Bytes('TestData'))

describe('Lock / onKeyPurchaseHook', () => {
  let lock
  let testEventHooks
  let receipt
  let from, to
  let keyPrice
  let tokenId

  beforeEach(async () => {
    ;[, from, to] = await ethers.getSigners()
    lock = await deployLock({ isEthers: true })

    const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
    testEventHooks = await TestEventHooks.deploy()
    const tx = await lock.setEventHooks(
      await testEventHooks.getAddress(),
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
    keyPrice = await lock.keyPrice()
    receipt = await tx.wait()
  })

  it('emit the correct event', async () => {
    await emitHookUpdatedEvent({
      receipt,
      hookName: 'onKeyPurchaseHook',
      hookAddress: await testEventHooks.getAddress(),
    })
  })

  it('can block purchases', async () => {
    await reverts(
      lock
        .connect(from)
        .purchase(
          [],
          [await to.getAddress()],
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
          [await to.getAddress()],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [dataField],
          {
            value: keyPrice,
          }
        )
      const receipt = await tx.wait()
      ;({
        args: { tokenId },
      } = await getEvent(receipt, 'Transfer'))
    })

    it('key sales should log the hook event', async () => {
      const { args } = (
        await testEventHooks.queryFilter('OnKeyPurchase')
      ).filter(({ fragment }) => fragment.name === 'OnKeyPurchase')[0]
      assert.equal(args.lock, await lock.getAddress())
      await compareBigNumbers(args.tokenId, tokenId)
      assert.equal(args.from, await from.getAddress())
      assert.equal(args.recipient, await to.getAddress())
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
            [await to.getAddress()],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [dataField],
            {
              value: keyPrice / 2n,
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
      await testEventHooks.configure(true, keyPrice / 2n)
    })

    it('can estimate the price', async () => {
      const price = await lock.purchasePriceFor(
        await to.getAddress(),
        ADDRESS_ZERO,
        dataField
      )
      await compareBigNumbers(price, keyPrice / 2n)
    })

    it('can buy at half price', async () => {
      await lock
        .connect(from)
        .purchase(
          [],
          [await to.getAddress()],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [dataField],
          {
            value: keyPrice / 2n,
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
          [await to.getAddress()],
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
            [await to.getAddress()],
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
        ).filter(({ fragment }) => fragment.name === 'OnKeyPurchase')[0]

        assert.equal(args.lock, await lock.getAddress())
        assert.equal(args.from, await from.getAddress())
        assert.equal(args.recipient, await to.getAddress())
        assert.equal(args.referrer, ADDRESS_ZERO)
        await compareBigNumbers(args.minKeyPrice, '0')
        await compareBigNumbers(args.pricePaid, '42')
      })
    })
  })
})
