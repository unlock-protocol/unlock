const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')
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
      assert.notEqual(owner, accounts[1]) // Making sure
      await shouldFail(locks['OWNED'].partialWithdraw(withdrawalAmount.toFixed(), {
        from: accounts[1]
      }), '')
    })

    it('should fail if too much is withdrawn', async () => {
      initialLockBalance = new BigNumber(await web3.eth.getBalance(locks['OWNED'].address))
      await shouldFail(locks['OWNED'].partialWithdraw(initialLockBalance.plus(withdrawalAmount).toFixed(), {
        from: owner
      }), 'NOT_ENOUGH_FUNDS')
    })

    it('should fail if requesting partial withdraw of 0', async () => {
      await shouldFail(locks['OWNED'].partialWithdraw(0, {
        from: owner
      }), 'GREATER_THAN_ZERO')
    })

    describe('when the owner withdraws some funds', () => {
      let initialOwnerBalance, expectedLockBalance, finalLockBalance, finalOwnerBalance, gasPrice, gasUsed, txObj, txHash, txFee

      before(async () => {
        expectedLockBalance = initialLockBalance.minus(withdrawalAmount)
        initialOwnerBalance = new BigNumber(await web3.eth.getBalance(owner))
        txObj = await locks['OWNED'].partialWithdraw(withdrawalAmount.toFixed(), {
          from: owner
        })
      })

      it('should increase the owner\'s balance with the amount of funds withdrawn from the lock', async () => {
        txHash = await web3.eth.getTransaction(txObj.tx)
        gasUsed = new BigNumber(txObj.receipt.gasUsed)
        gasPrice = new BigNumber(txHash.gasPrice)
        txFee = gasPrice.times(gasUsed)
        finalOwnerBalance = new BigNumber(await web3.eth.getBalance(owner))
        assert.equal(finalOwnerBalance.toFixed(), initialOwnerBalance.plus(withdrawalAmount).minus(txFee).toFixed())
      })

      it('should decrease the lock\'s balance by the amount of funds withdrawn from the lock', async () => {
        finalLockBalance = new BigNumber(await web3.eth.getBalance(locks['OWNED'].address))
        assert.equal(finalLockBalance.toFixed(), expectedLockBalance.toFixed())
      })
    })
  })
})
