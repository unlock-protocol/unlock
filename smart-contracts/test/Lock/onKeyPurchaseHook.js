const BigNumber = require('bignumber.js')
const { reverts } = require('../helpers/errors')
const deployLocks = require('../helpers/deployLocks')
const { ADDRESS_ZERO, MAX_UINT } = require('../helpers/constants')

const unlockContract = artifacts.require('Unlock.sol')
const TestEventHooks = artifacts.require('TestEventHooks.sol')
const getContractInstance = require('../helpers/truffle-artifacts')

let lock
let locks
let unlock
let testEventHooks

contract('Lock / onKeyPurchaseHook', (accounts) => {
  const from = accounts[1]
  const to = accounts[2]
  const dataField = web3.utils.asciiToHex('TestData')
  let keyPrice

  beforeEach(async () => {
    unlock = await getContractInstance(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    await lock.setMaxKeysPerAddress(10)
    testEventHooks = await TestEventHooks.new()
    await lock.setEventHooks(
      testEventHooks.address,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
    keyPrice = new BigNumber(await lock.keyPrice())
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
      await lock.purchase(
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
    })

    it('key sales should log the hook event', async () => {
      const log = (await testEventHooks.getPastEvents('OnKeyPurchase'))[0]
        .returnValues
      assert.equal(log.lock, lock.address)
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
