const BigNumber = require('bignumber.js')
const { deployLock, purchaseKey, purchaseKeys } = require('../helpers')
const Unlock = artifacts.require('Unlock.sol')

let lock
let unlock
const price = new BigNumber(web3.utils.toWei('0.01', 'ether'))

contract('Unlock / lockTotalSales', () => {
  before(async () => {
    lock = await deployLock()
    unlock = await Unlock.at(await lock.unlockProtocol())
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
      assert.equal(totalSales.toString(), price.times(5).toString())
    })
  })
})
