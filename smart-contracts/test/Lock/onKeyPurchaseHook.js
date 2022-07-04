const { assert } = require('chai')
const { ethers } = require('hardhat')
const { deployLock, reverts, ADDRESS_ZERO, MAX_UINT } = require('../helpers')

let lock
let testEventHooks

describe('Lock / onKeyPurchaseHook', () => {
  let from, to
  const dataField = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('TestData'))
  let keyPrice

  before(async () => {
    ;[, from, to] = await ethers.getSigners()

    lock = await deployLock()
    await lock.setMaxKeysPerAddress(10)
    // await lock.setMaxNumbersOfKeys(50)
    keyPrice = await lock.keyPrice()

    const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
    testEventHooks = await TestEventHooks.deploy()
    await testEventHooks.deployed()

    await lock.setEventHooks(
      testEventHooks.address,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
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
    before(async () => {
      await testEventHooks.configure(true, '0')
      await lock
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
    })

    it('key sales should log the hook event', async () => {
      const [event] = await testEventHooks.queryFilter('OnKeyPurchase')
      const { args } = event
      assert.equal(args.lock, lock.address)
      assert.equal(args.from, from.address)
      assert.equal(args.recipient, to.address)
      assert.equal(args.referrer, ADDRESS_ZERO)
      assert.equal(args.minKeyPrice.toString(), keyPrice.toString())
      assert.equal(args.pricePaid.toString(), keyPrice.toString())
    })

    it('Sanity check: cannot buy at half price', async () => {
      await reverts(
        lock.purchase(
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
      await reverts(
        lock.setEventHooks(
          to.address,
          ADDRESS_ZERO,
          ADDRESS_ZERO,
          ADDRESS_ZERO,
          ADDRESS_ZERO
        ),
        'INVALID_HOOK(0)'
      )
    })
  })

  describe('with a 50% off discount', () => {
    before(async () => {
      await testEventHooks.configure(true, keyPrice.div(2))
    })

    it('can estimate the price', async () => {
      const price = await lock.purchasePriceFor(
        to.address,
        ADDRESS_ZERO,
        dataField
      )
      assert.equal(price, keyPrice.div(2).toString())
    })

    it('can buy at half price', async () => {
      await lock.purchase(
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
    before(async () => {
      await testEventHooks.configure(true, MAX_UINT)
    })

    it('purchases are now free', async () => {
      await lock.purchase(
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
        await lock.purchase(
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
        const [event] = await testEventHooks.queryFilter('OnKeyPurchase')
        const { args } = event
        assert.equal(args.lock, lock.address)
        assert.equal(args.from, from.address)
        assert.equal(args.recipient, to.address)
        assert.equal(args.referrer, ADDRESS_ZERO)
        assert.equal(args.minKeyPrice.toString(), '0')
        assert.equal(args.pricePaid.toString(), '42')
      })
    })
  })
})
