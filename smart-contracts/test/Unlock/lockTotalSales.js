const BigNumber = require('bignumber.js')
const { deployLock, purchaseKey, purchaseKeys } = require('../helpers')

let lock
let unlock
const price = new BigNumber(web3.utils.toWei('0.01', 'ether'))

contract('Unlock / lockTotalSales', () => {
  before(async () => {
    lock = await deployLock()
  })

  it('total sales defaults to 0', async () => {
    const totalSales = new BigNumber(
      (await unlock.locks(lock.address)).totalSales
    )
    assert.equal(totalSales.toFixed(), 0)
  })

  describe('buy 1 key', () => {
    before(async () => {
      await purchaseKey(lock)
    })

    it('total sales includes the purchase', async () => {
      const totalSales = new BigNumber(
        (await unlock.locks(lock.address)).totalSales
      )
      assert.equal(totalSales.toFixed(), price.toFixed())
    })
  })

  describe('buy multiple keys', () => {
    before(async () => {
      await purchaseKeys(lock, 4)
    })

    it('total sales incluse all purchases', async () => {
      const totalSales = new BigNumber(
        (await unlock.locks(lock.address)).totalSales
      )
      assert.equal(totalSales.toFixed(), price.times(5).toFixed())
    })
  })
})
