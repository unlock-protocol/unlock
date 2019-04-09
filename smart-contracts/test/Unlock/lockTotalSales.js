const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../helpers/proxy')

let unlock, locks

contract('Unlock / lockTotalSales', accounts => {
  const price = new BigNumber(Units.convert('0.01', 'eth', 'wei'))
  let lock

  before(async () => {
    unlock = await getUnlockProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks['FIRST']
  })

  it('total sales defaults to 0', async () => {
    const totalSales = new BigNumber(
      (await unlock.locks.call(lock.address)).totalSales
    )
    assert.equal(totalSales.toFixed(), 0)
  })

  describe('buy 1 key', () => {
    before(async () => {
      await lock.purchaseFor(accounts[0], {
        value: price,
        from: accounts[0],
      })
    })

    it('total sales includes the purchase', async () => {
      const totalSales = new BigNumber(
        (await unlock.locks.call(lock.address)).totalSales
      )
      assert.equal(totalSales.toFixed(), price.toFixed())
    })
  })

  describe('buy multiple keys', () => {
    before(async () => {
      for (let i = 1; i < 5; i++) {
        await lock.purchaseFor(accounts[i], {
          value: price,
          from: accounts[i],
        })
      }
    })

    it('total sales incluse all purchases', async () => {
      const totalSales = new BigNumber(
        (await unlock.locks.call(lock.address)).totalSales
      )
      assert.equal(totalSales.toFixed(), price.times(5).toFixed())
    })
  })
})
