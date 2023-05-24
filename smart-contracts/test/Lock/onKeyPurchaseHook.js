const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')
const { deployLock, reverts, ADDRESS_ZERO, MAX_UINT } = require('../helpers')

const TestEventHooks = artifacts.require('TestEventHooks.sol')

let lock
let testEventHooks
let tx

contract('Lock / onKeyPurchaseHook', (accounts) => {
  const from = accounts[1]
  const to = accounts[2]
  const dataField = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('TestData'))
  let keyPrice
  let tokenId

  beforeEach(async () => {
    lock = await deployLock()
    testEventHooks = await TestEventHooks.new()
    tx = await lock.setEventHooks(
      testEventHooks.address,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
    keyPrice = new BigNumber(await lock.keyPrice())
  })

  it('emit the correct event', async () => {
    const { args } = tx.logs.find(({ event }) => event === 'EventHooksUpdated')
    assert.equal(args.onKeyPurchaseHook, testEventHooks.address)
    assert.equal(args.onKeyCancelHook, ADDRESS_ZERO)
    assert.equal(args.onValidKeyHook, ADDRESS_ZERO)
    assert.equal(args.onTokenURIHook, ADDRESS_ZERO)
    assert.equal(args.onKeyTransferHook, ADDRESS_ZERO)
    assert.equal(args.onKeyExtendHook, ADDRESS_ZERO)
    assert.equal(args.onKeyGrantHook, ADDRESS_ZERO)
  })

  it('can block purchases', async () => {
    await reverts(
      lock.purchase([], [to], [ADDRESS_ZERO], [ADDRESS_ZERO], [dataField], {
        from,
        value: keyPrice.toFixed(),
      }),
      'PURCHASE_BLOCKED_BY_HOOK'
    )
  })

  describe('when enabled without discount', () => {
    beforeEach(async () => {
      await testEventHooks.configure(true, '0')
      const tx = await lock.purchase(
        [],
        [to],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [dataField],
        {
          from,
          value: keyPrice.toFixed(),
        }
      )
      ;({ tokenId } = tx.logs[0].args)
    })

    it('key sales should log the hook event', async () => {
      const log = (await testEventHooks.getPastEvents('OnKeyPurchase'))[0]
        .returnValues
      assert.equal(log.lock, lock.address)
      assert.equal(log.tokenId, tokenId)
      assert.equal(log.from, from)
      assert.equal(log.recipient, to)
      assert.equal(log.referrer, ADDRESS_ZERO)
      assert.equal(log.minKeyPrice, keyPrice.toFixed())
      assert.equal(log.pricePaid, keyPrice.toFixed())
    })

    it('Sanity check: cannot buy at half price', async () => {
      await reverts(
        lock.purchase([], [to], [ADDRESS_ZERO], [ADDRESS_ZERO], [dataField], {
          from,
          value: keyPrice.div(2).toFixed(),
        }),
        'INSUFFICIENT_VALUE'
      )
    })

    it('cannot set the hook to a non-contract address', async () => {
      await reverts(
        lock.setEventHooks(
          accounts[1],
          ADDRESS_ZERO,
          ADDRESS_ZERO,
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
    beforeEach(async () => {
      await testEventHooks.configure(true, keyPrice.div(2).toFixed())
    })

    it('can estimate the price', async () => {
      const price = await lock.purchasePriceFor(to, ADDRESS_ZERO, dataField)
      assert.equal(price, keyPrice.div(2).toFixed())
    })

    it('can buy at half price', async () => {
      await lock.purchase(
        [],
        [to],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [dataField],
        {
          from,
          value: keyPrice.div(2).toFixed(),
        }
      )
    })
  })

  describe('with a huge discount', () => {
    beforeEach(async () => {
      await testEventHooks.configure(true, MAX_UINT)
    })

    it('purchases are now free', async () => {
      await lock.purchase(
        [],
        [to],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [dataField],
        {
          from,
          value: '0',
        }
      )
    })

    describe('can still send tips', () => {
      beforeEach(async () => {
        await lock.purchase(
          [],
          [to],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [dataField],
          {
            from,
            value: '42',
          }
        )
      })

      it('key sales should log the hook event', async () => {
        const log = (await testEventHooks.getPastEvents('OnKeyPurchase'))[0]
          .returnValues
        assert.equal(log.lock, lock.address)
        assert.equal(log.from, from)
        assert.equal(log.recipient, to)
        assert.equal(log.referrer, ADDRESS_ZERO)
        assert.equal(log.minKeyPrice, '0')
        assert.equal(log.pricePaid, '42')
      })
    })
  })
})
