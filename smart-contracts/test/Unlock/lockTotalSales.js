const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../helpers/truffle-artifacts')
const { ADDRESS_ZERO } = require('../helpers/constants')

let unlock
let locks

contract('Unlock / lockTotalSales', (accounts) => {
  const price = new BigNumber(ethers.utils.parseUnits('0.01', 'ether'))
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
    assert.equal(totalSales.toFixed(), 0)
  })

  describe('buy 1 key', () => {
    before(async () => {
      await lock.purchase(
        [],
        [accounts[0]],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          value: price,
          from: accounts[0],
        }
      )
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
      for (let i = 1; i < 5; i++) {
        await lock.purchase(
          [],
          [accounts[i]],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: price,
            from: accounts[i],
          }
        )
      }
    })

    it('total sales incluse all purchases', async () => {
      const totalSales = new BigNumber(
        (await unlock.locks(lock.address)).totalSales
      )
      assert.equal(totalSales.toFixed(), price.times(5).toFixed())
    })
  })
})
