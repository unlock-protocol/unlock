const truffleAssert = require('truffle-assertions')
const BigNumber = require('bignumber.js')
const deployLocks = require('../helpers/deployLocks')
const getProxy = require('../helpers/proxy')

const unlockContract = artifacts.require('Unlock.sol')

let unlock
let locks
const keyPrice = web3.utils.toWei('0.01', 'ether')

contract('Lock / GasRefund', (accounts) => {
  let lock
  const tokenAddress = web3.utils.padLeft(0, 40)
  let userETHBalanceBefore

  beforeEach(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0], tokenAddress)
    lock = locks.FIRST
  })

  describe('gas refund percentage', () => {
    it('get set properly', async () => {
      await lock.setGasRefundPercentage(25)
      assert.equal(await lock.gasRefundPercentage(), 25)
    })

    it('can not be set if caller is not lock manager or beneficiary', async () => {
      await truffleAssert.fails(
        lock.setGasRefundPercentage(25, {
          from: accounts[3],
        }),
        'revert',
        'ONLY_LOCK_MANAGER_OR_BENEFICIARY'
      )
    })

    it('can be by set beneficiary', async () => {
      await lock.setGasRefundPercentage(25, { from: accounts[0] })
      assert.equal(await lock.gasRefundPercentage(), 25)
    })

    it('can set by lock manager', async () => {
      await lock.addLockManager(accounts[5], { from: accounts[0] })
      await lock.setGasRefundPercentage(25, { from: accounts[5] })
      assert.equal(await lock.gasRefundPercentage(), 25)
    })
  })

  describe('purchase with gas refund', () => {
    let tx

    beforeEach(async () => {
      // set gasRefund
      await lock.setGasRefundPercentage(25)

      userETHBalanceBefore = await web3.eth.getBalance(accounts[2])

      tx = await lock.purchase(
        keyPrice.toString(),
        accounts[2],
        web3.utils.padLeft(0, 40),
        [],
        {
          from: accounts[2],
          value: keyPrice.toString(),
        }
      )
    })

    it('gas refunded event is fired', async () => {
      const evt = tx.logs.find((v) => v.event === 'GasRefunded')
      const {
        receiver,
        refundedAmount,
        tokenAddress: refundedTokenAddress,
      } = evt.args

      assert.equal(receiver, accounts[2])
      assert.equal(refundedAmount.toNumber(), keyPrice * 0.25)
      assert.equal(refundedTokenAddress, tokenAddress)
    })

    it('user gas has been refunded', async () => {
      const userETHBalanceAfter = await web3.eth.getBalance(accounts[2])

      const { gasPrice: _gasPrice } = await web3.eth.getTransaction(tx.tx)
      const { gasUsed: _gasUsed } = tx.receipt

      const gasUsed = new BigNumber(_gasUsed)
      const gasPrice = new BigNumber(_gasPrice)
      const gas = gasPrice.times(gasUsed)

      const expected = new BigNumber(userETHBalanceBefore)
        .minus(keyPrice) // buy a key
        .minus(gas) // pay for the gas
        .plus(keyPrice * 0.25) // get a refund

      assert.equal(userETHBalanceAfter, expected.toNumber())
    })
  })

  describe('purchase without gas refund', () => {
    let tx

    beforeEach(async () => {
      userETHBalanceBefore = await web3.eth.getBalance(accounts[2])

      tx = await lock.purchase(
        keyPrice.toString(),
        accounts[2],
        web3.utils.padLeft(0, 40),
        [],
        {
          from: accounts[2],
          value: keyPrice.toString(),
        }
      )
    })

    it('does not fire refunded event', async () => {
      const evt = tx.logs.find((v) => v.event === 'GasRefunded')
      assert.equal(evt, undefined)
    })

    it('user gas is not refunded', async () => {
      const userETHBalanceAfter = await web3.eth.getBalance(accounts[2])

      const { gasPrice: _gasPrice } = await web3.eth.getTransaction(tx.tx)
      const { gasUsed: _gasUsed } = tx.receipt

      const gasUsed = new BigNumber(_gasUsed)
      const gasPrice = new BigNumber(_gasPrice)
      const gas = gasPrice.times(gasUsed)

      const expected = new BigNumber(userETHBalanceBefore)
        .minus(keyPrice) // buy a key
        .minus(gas) // pay for the gas
      assert.equal(userETHBalanceAfter, expected.toNumber())
    })
  })
})
