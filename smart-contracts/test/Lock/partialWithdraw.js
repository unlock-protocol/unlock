const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')
const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../helpers/proxy')
let unlock, locks

contract('Lock / partialWithdraw', accounts => {
  before(async () => {
    unlock = await getUnlockProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  let owner, price, initialLockBalance, withdrawalAmount
  price = new BigNumber(Units.convert('0.01', 'eth', 'wei'))
  withdrawalAmount = new BigNumber(Units.convert('0.005', 'eth', 'wei'))

  before(() => {
    const purchases = [accounts[1], accounts[2]].map(account => {
      return locks['OWNED'].purchaseFor(account, {
        value: price.toFixed(),
        from: account,
      })
    })
    return Promise.all(purchases)
      .then(() => {
        return locks['OWNED'].owner.call()
      })
      .then(_owner => {
        owner = _owner
      })
  })

  it('should fail if called by address other than owner', async () => {
    assert.notEqual(owner, accounts[1]) // Making sure
    await shouldFail(
      locks['OWNED'].partialWithdraw(withdrawalAmount.toFixed(), {
        from: accounts[1],
      }),
      ''
    )
  })

  it('should fail if too much is withdrawn', async () => {
    initialLockBalance = new BigNumber(
      await web3.eth.getBalance(locks['OWNED'].address)
    )
    await shouldFail(
      locks['OWNED'].partialWithdraw(
        initialLockBalance.plus(withdrawalAmount).toFixed(),
        {
          from: owner,
        }
      ),
      'NOT_ENOUGH_FUNDS'
    )
  })

  it('should fail if requesting partial withdraw of 0', async () => {
    await shouldFail(
      locks['OWNED'].partialWithdraw(0, {
        from: owner,
      }),
      'GREATER_THAN_ZERO'
    )
  })

  describe('when the owner withdraws some funds', () => {
    let initialOwnerBalance,
      expectedLockBalance,
      finalLockBalance,
      finalOwnerBalance,
      gasPrice,
      gasUsed,
      txObj,
      txHash,
      txFee

    before(async () => {
      expectedLockBalance = initialLockBalance.minus(withdrawalAmount)
      initialOwnerBalance = new BigNumber(await web3.eth.getBalance(owner))
      txObj = await locks['OWNED'].partialWithdraw(withdrawalAmount.toFixed(), {
        from: owner,
      })
    })

    it("should increase the owner's balance with the amount of funds withdrawn from the lock", async () => {
      txHash = await web3.eth.getTransaction(txObj.tx)
      gasUsed = new BigNumber(txObj.receipt.gasUsed)
      gasPrice = new BigNumber(txHash.gasPrice)
      txFee = gasPrice.times(gasUsed)
      finalOwnerBalance = new BigNumber(await web3.eth.getBalance(owner))
      assert.equal(
        finalOwnerBalance.toFixed(),
        initialOwnerBalance
          .plus(withdrawalAmount)
          .minus(txFee)
          .toFixed()
      )
    })

    it("should decrease the lock's balance by the amount of funds withdrawn from the lock", async () => {
      finalLockBalance = new BigNumber(
        await web3.eth.getBalance(locks['OWNED'].address)
      )
      assert.equal(finalLockBalance.toFixed(), expectedLockBalance.toFixed())
    })
  })
})
