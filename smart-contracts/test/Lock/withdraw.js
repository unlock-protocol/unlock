
const Units = require('ethereumjs-units')

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
        return locks['OWNED'].purchaseFor(account, '', {
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

    describe('when the owner withdraws all funds', () => {
      let ownerBalance, lockBalance
      before(() => {
        lockBalance = web3.eth.getBalance(locks['OWNED'].address)
        ownerBalance = web3.eth.getBalance(owner)
        return locks['OWNED'].withdraw({
          from: owner
        })
      })
      it('should increase the owner\'s balance with the funds from the lock', () => {
        assert(web3.eth.getBalance(owner) > ownerBalance)
      })

      it('should set the lock\'s balance to 0', () => {
        assert.equal(web3.eth.getBalance(locks['OWNED'].address), 0)
      })
    })
  })

  describe('partial withdrawal', () => {
    let owner
    let price = Units.convert('0.01', 'eth', 'wei')
    const withdrawalAmount = Units.convert('0.001', 'eth', 'wei')

    before(() => {
      const purchases = [accounts[1], accounts[2]].map((account) => {
        return locks['OWNED'].purchaseFor(account, '', {
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
      return locks['OWNED'].partialWithdraw(withdrawalAmount, {
        from: accounts[1]
      }).catch(error => {
        assert.equal(error.message, 'VM Exception while processing transaction: revert')
      })
    })

    describe('when the owner withdraws some funds', () => {
      let initialOwnerBalance, initialLockBalance, expectedLockBalance, finalLockBalance

      before(() => {
        initialLockBalance = web3.eth.getBalance(locks['OWNED'].address)
        expectedLockBalance = initialLockBalance.sub(withdrawalAmount)
        initialOwnerBalance = web3.eth.getBalance(owner)
        return locks['OWNED'].partialWithdraw(withdrawalAmount, {
          from: owner
        })
      })
      it('should increase the owner\'s balance with the amount of funds withdrawn from the lock', () => {
        console.log(initialOwnerBalance)
        console.log(web3.eth.getBalance(owner))
        assert(web3.eth.getBalance(owner).gt(initialOwnerBalance))
      })

      it('should decrease the lock\'s balance by the amount of funds withdrawn from the lock', () => {
        finalLockBalance = (web3.eth.getBalance(locks['OWNED'].address)).toNumber()
        console.log(expectedLockBalance)
        console.log(finalLockBalance)
        assert.equal(finalLockBalance, expectedLockBalance)
      })
    })
  })
})
