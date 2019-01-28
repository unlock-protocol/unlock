const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const Unlock = artifacts.require('../Unlock.sol')
let unlock, locks

contract('Lock', (accounts) => {
  before(async () => {
    unlock = await Unlock.deployed()
    locks = await deployLocks(unlock)
  })

  describe('partialWithdraw', () => {
    let owner, price, initialLockBalance, withdrawalAmount
    price = new BigNumber(Units.convert('0.01', 'eth', 'wei'))
    withdrawalAmount = new BigNumber(Units.convert('0.005', 'eth', 'wei'))

    before(() => {
      const purchases = [accounts[1], accounts[2]].map((account) => {
        return locks['OWNED'].purchaseFor(account, Web3Utils.toHex(''), {
          value: price.toFixed(),
          from: account
        })
      })
      return Promise.all(purchases)
        .then(() => {
          return locks['OWNED'].owner.call()
        })
        .then((_owner) => {
          owner = _owner
        })
    })

    it('should fail if called by address other than owner', async () => {
      try {
        assert.notEqual(owner, accounts[1]) // Making sure
        await locks['OWNED'].partialWithdraw(withdrawalAmount, {
          from: accounts[1]
        })
      } catch (error) {
        assert.equal(error.message, 'VM Exception while processing transaction: revert')
        return
      }
      assert.fail()
    })

    it('should fail if too much is withdrawn', async () => {
      try {
        initialLockBalance = new BigNumber(web3.eth.getBalance(locks['OWNED'].address))
        await locks['OWNED'].partialWithdraw(initialLockBalance.plus(withdrawalAmount), {
          from: owner
        })
      } catch (error) {
        assert.equal(error.message, 'VM Exception while processing transaction: revert Not enough funds')
        return
      }
      assert.fail()
    })

    it('should fail if requesting partial withdraw of 0', async () => {
      try {
        await locks['OWNED'].partialWithdraw(0, {
          from: owner
        })
        assert.fail()
      } catch (error) {
        assert.equal(error.message, 'VM Exception while processing transaction: revert Must request an amount greater than 0')
      }
    })

    describe('when the owner withdraws some funds', () => {
      let initialOwnerBalance, expectedLockBalance, finalLockBalance, finalOwnerBalance, gasPrice, gasUsed, txObj, txHash, txFee

      before(async () => {
        expectedLockBalance = initialLockBalance.minus(withdrawalAmount)
        initialOwnerBalance = new BigNumber(web3.eth.getBalance(owner))
        txObj = await locks['OWNED'].partialWithdraw(withdrawalAmount, {
          from: owner
        })
      })

      it('should increase the owner\'s balance with the amount of funds withdrawn from the lock', async () => {
        txHash = await web3.eth.getTransaction(txObj.tx)
        gasUsed = new BigNumber(txObj.receipt.gasUsed)
        gasPrice = new BigNumber(txHash.gasPrice)
        txFee = gasPrice.mul(gasUsed)
        finalOwnerBalance = new BigNumber(web3.eth.getBalance(owner))
        assert.equal(finalOwnerBalance.toFixed(), initialOwnerBalance.plus(withdrawalAmount).minus(txFee).toFixed())
      })

      it('should decrease the lock\'s balance by the amount of funds withdrawn from the lock', async () => {
        finalLockBalance = new BigNumber(web3.eth.getBalance(locks['OWNED'].address))
        assert.equal(finalLockBalance.toFixed(), expectedLockBalance)
      })
    })
  })
})
