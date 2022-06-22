const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../helpers/truffle-artifacts')
const { purchaseKey, purchaseKeys } = require('../helpers')

let unlock
let locks

contract('Unlock / lockTotalSales', (accounts) => {
  const price = ethers.utils.parseUnits('0.01', 'ether')
  let lock

  before(async () => {
    unlock = await getContractInstance(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
  })

  it('total sales defaults to 0', async () => {
    const totalSales = new BigNumber(
      (await unlock.locks(lock.address)).totalSales
    )
    assert.equal(totalSales.toString(), 0)
  })

  describe('buy 1 key', () => {
    before(async () => {
      await purchaseKey(lock)
    })

    it('total sales includes the purchase', async () => {
      const totalSales = new BigNumber(
        (await unlock.locks(lock.address)).totalSales
      )
      assert.equal(totalSales.toString(), price.toString())
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
      assert.equal(totalSales.toString(), price.mul(5).toString())
    })
  })
})
