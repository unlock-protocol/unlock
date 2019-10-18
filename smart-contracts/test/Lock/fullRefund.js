const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock, locks

contract('Lock / fullRefund', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  let lock
  const keyOwners = [accounts[1], accounts[2], accounts[3], accounts[4]]
  const keyPrice = new BigNumber(Units.convert(0.01, 'eth', 'wei'))
  const refundAmount = new BigNumber(Units.convert(0.01, 'eth', 'wei'))
  let lockOwner

  before(async () => {
    lock = locks['SECOND']
    const purchases = keyOwners.map(account => {
      return lock.purchase(0, account, web3.utils.padLeft(0, 40), [], {
        value: keyPrice.toFixed(),
        from: account,
      })
    })
    await Promise.all(purchases)
    lockOwner = await lock.owner.call()
  })

  describe('should cancel and refund when enough time remains', () => {
    let initialLockBalance, initialKeyOwnerBalance, txObj

    before(async () => {
      initialLockBalance = new BigNumber(
        await web3.eth.getBalance(lock.address)
      )
      initialKeyOwnerBalance = new BigNumber(
        await web3.eth.getBalance(keyOwners[0])
      )
      txObj = await lock.fullRefund(keyOwners[0], refundAmount, {
        from: lockOwner,
      })
    })

    it('should emit a CancelKey event', async () => {
      assert.equal(txObj.logs[0].event, 'CancelKey')
    })

    it('the amount of refund should be the key price', async () => {
      const refund = new BigNumber(txObj.logs[0].args.refund)
      assert.equal(refund.toFixed(), keyPrice.toFixed())
    })

    it('should make the key no longer valid (i.e. expired)', async () => {
      const isValid = await lock.getHasValidKey.call(keyOwners[0])
      assert.equal(isValid, false)
    })

    it("should increase the owner's balance with the amount of funds refunded from the lock", async () => {
      const txHash = await web3.eth.getTransaction(txObj.tx)
      const gasUsed = new BigNumber(txObj.receipt.gasUsed)
      const gasPrice = new BigNumber(txHash.gasPrice)
      const txFee = gasPrice.times(gasUsed)
      const finalOwnerBalance = new BigNumber(
        await web3.eth.getBalance(keyOwners[0])
      )
      assert(
        finalOwnerBalance.toFixed(),
        initialKeyOwnerBalance
          .plus(keyPrice)
          .minus(txFee)
          .toFixed()
      )
    })

    it("should increase the locks's balance by the keyPrice", async () => {
      const finalLockBalance = new BigNumber(
        await web3.eth.getBalance(lock.address)
      ).minus(initialLockBalance)

      assert(
        finalLockBalance.toFixed(),
        initialLockBalance.minus(keyPrice).toFixed()
      )
    })
  })

  describe('should fail when', () => {
    it('should fail if invoked by the key owner', async () => {
      await shouldFail(
        lock.fullRefund(keyOwners[3], refundAmount, {
          from: keyOwners[3],
        }),
        ''
      )
    })

    it('should fail if invoked by another user', async () => {
      await shouldFail(
        lock.fullRefund(accounts[7], refundAmount, {
          from: keyOwners[3],
        }),
        ''
      )
    })

    it('should fail if the Lock owner withdraws too much funds', async () => {
      await lock.withdraw(await lock.tokenAddress.call(), 0, {
        from: lockOwner,
      })
      await shouldFail(
        lock.fullRefund(keyOwners[3], refundAmount, {
          from: lockOwner,
        }),
        ''
      )
    })

    it('the key is expired', async () => {
      await lock.expireKeyFor(keyOwners[3], {
        from: lockOwner,
      })
      await shouldFail(
        lock.fullRefund(keyOwners[3], refundAmount, {
          from: lockOwner,
        }),
        'KEY_NOT_VALID'
      )
    })

    it('the owner does not have a key', async () => {
      await shouldFail(
        lock.fullRefund(accounts[7], refundAmount, {
          from: lockOwner,
        }),
        'KEY_NOT_VALID'
      )
    })
  })
})
