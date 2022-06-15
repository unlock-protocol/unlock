const BigNumber = require('bignumber.js')
const { ADDRESS_ZERO } = require('../helpers/constants')

const { reverts } = require('../helpers/errors')
const { ethers } = require('hardhat')
const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../helpers/truffle-artifacts')
const { ZERO_ADDRESS } = require('@openzeppelin/test-helpers/src/constants')

const BASIS_POINT_DENOMINATOR = 10000

contract('Lock / setReferrerFee', (accounts) => {
  let lock
  let referrer

  before(async () => {
    referrer = accounts[5]
    const unlock = await getContractInstance(unlockContract)
    const locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    await lock.setMaxKeysPerAddress(10)
  })

  it('has a default fee of 0%', async () => {
    const fee = new BigNumber(await lock.referrerFees(referrer))
    assert.equal(fee.div(BASIS_POINT_DENOMINATOR).toNumber(), 0)
  })

  it('reverts if a non-manager attempts to change the fee', async () => {
    await reverts(
      lock.updateTransferFee(0, { from: accounts[1] }),
      'ONLY_LOCK_MANAGER'
    )
  })

  describe('setting 5% fee', () => {
    before(async () => {
      await lock.setReferrerFee(referrer, 500)
    })
    it('store fee correctly', async () => {
      const fee = new BigNumber(await lock.referrerFees(referrer))
      assert.equal(fee.div(BASIS_POINT_DENOMINATOR).toFixed(), 0.05)
    })
  })

  describe('setting 20% general fee', () => {
    before(async () => {
      await lock.setReferrerFee(ZERO_ADDRESS, 2000)
    })
    it('store fee correctly', async () => {
      const fee = new BigNumber(await lock.referrerFees(ZERO_ADDRESS))
      assert.equal(fee.div(BASIS_POINT_DENOMINATOR).toFixed(), 0.2)
    })
  })

  describe('updating/cancelling a 5% fee', () => {
    before(async () => {
      await lock.setReferrerFee(referrer, 500)
    })
    it('fee can cancelled', async () => {
      await lock.setReferrerFee(referrer, 0)
      const fee = new BigNumber(await lock.referrerFees(referrer))
      assert.equal(fee.div(BASIS_POINT_DENOMINATOR).toNumber(), 0)
    })
    it('fee can updated correctly', async () => {
      await lock.setReferrerFee(referrer, 7000)
      const fee = new BigNumber(await lock.referrerFees(referrer))
      assert.equal(fee.div(BASIS_POINT_DENOMINATOR).toFixed(), 0.7)
    })
  })
})
