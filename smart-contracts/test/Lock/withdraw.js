const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const Unlock = artifacts.require('../Unlock.sol')

let unlock, locks

contract('Lock', (accounts) => {
  before(() => {
    return Unlock.deployed()
      .then(_unlock => {
        unlock = _unlock
        return deployLocks(unlock)
      })
      .then(_locks => {
        locks = _locks
      })
  })

  describe('withdraw', () => {
    let owner
    let price = Units.convert('0.01', 'eth', 'wei')

    before(() => {
      const purchases = [accounts[1], accounts[2]].map((account) => {
        return locks['OWNED'].purchaseFor(account, Web3Utils.toHex(''), {
          value: price,
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

    it('should only allow the owner to withdraw', () => {
      assert.notEqual(owner, accounts[1]) // Making sure
      return locks['OWNED'].withdraw({
        from: accounts[1]
      }).catch(error => {
        assert.equal(error.message, 'VM Exception while processing transaction: revert')
      })
    })

    describe('when the owner withdraws funds', () => {
      let ownerBalance, lockBalance
      before(async () => {
        lockBalance = new BigNumber(await web3.eth.getBalance(locks['OWNED'].address))
        ownerBalance = new BigNumber(await web3.eth.getBalance(owner))
        return locks['OWNED'].withdraw({
          from: owner
        })
      })
      it('should increase the owner\'s balance with the funds from the lock', async () => {
        const balance = new BigNumber(await web3.eth.getBalance(owner))
        assert(balance.gt(ownerBalance))
      })

      it('should set the lock\'s balance to 0', async () => {
        assert.equal(await web3.eth.getBalance(locks['OWNED'].address), 0)
      })
    })
  })
})
