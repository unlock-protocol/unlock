const assert = require('assert')
const { ethers } = require('hardhat')
const {
  deployContracts,
  deployLock,
  purchaseKey,
  purchaseKeys,
} = require('../helpers')

let lock
let unlock
let keyOwner
const price = ethers.parseUnits('0.01', 'ether')

describe('Unlock / lockTotalSales', () => {
  before(async () => {
    ;[keyOwner] = await ethers.getSigners()
    ;({ unlock } = await deployContracts())
    lock = await deployLock({ unlock })
  })

  it('total sales defaults to 0', async () => {
    const { totalSales } = await unlock.locks(await lock.getAddress())
    assert.equal(totalSales, 0)
  })

  describe('buy 1 key', () => {
    before(async () => {
      await purchaseKey(lock, await keyOwner.getAddress())
    })

    it('total sales includes the purchase', async () => {
      const { totalSales } = await unlock.locks(await lock.getAddress())
      assert.equal(totalSales, price)
    })
  })

  describe('buy multiple keys', () => {
    before(async () => {
      await purchaseKeys(lock, 4)
    })

    it('total sales incluse all purchases', async () => {
      const { totalSales } = await unlock.locks(await lock.getAddress())
      assert.equal(totalSales, price * 5n)
    })
  })
})
