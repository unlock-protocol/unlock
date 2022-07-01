const { ethers } = require('hardhat')
const {
  deployContracts,
  deployLock,
  purchaseKey,
  purchaseKeys,
} = require('../helpers')

let lock
let unlock
const price = ethers.utils.parseUnits('0.01', 'ether')

describe('Unlock / lockTotalSales', () => {
  before(async () => {
    ;({ unlock } = await deployContracts())
    lock = await deployLock({ unlock })
  })

  it('total sales defaults to 0', async () => {
    const { totalSales } = await unlock.locks(lock.address)
    assert.equal(totalSales, 0)
  })

  describe('buy 1 key', () => {
    before(async () => {
      await purchaseKey(lock)
    })

    it('total sales includes the purchase', async () => {
      const { totalSales } = await unlock.locks(lock.address)
      assert.equal(totalSales.toString(), price.toString())
    })
  })

  describe('buy multiple keys', () => {
    before(async () => {
      await purchaseKeys(lock, 4)
    })

    it('total sales incluse all purchases', async () => {
      const { totalSales } = await unlock.locks(lock.address)
      assert.equal(totalSales.toString(), price.mul(5).toString())
    })
  })
})
