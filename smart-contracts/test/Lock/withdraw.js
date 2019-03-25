const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')
const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../helpers/proxy')

let unlock, locks

contract('Lock / withdraw', accounts => {
  before(async () => {
    unlock = await getUnlockProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  let owner
  let price = Units.convert('0.01', 'eth', 'wei')

  before(() => {
    const purchases = [accounts[1], accounts[2]].map(account => {
      return locks['OWNED'].purchaseFor(account, {
        value: price,
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

  it('should only allow the owner to withdraw', async () => {
    assert.notEqual(owner, accounts[1]) // Making sure
    await shouldFail(
      locks['OWNED'].withdraw({
        from: accounts[1],
      }),
      ''
    )
  })

  describe('when the owner withdraws funds', () => {
    let ownerBalance
    before(async () => {
      ownerBalance = new BigNumber(await web3.eth.getBalance(owner))
      return locks['OWNED'].withdraw({
        from: owner,
      })
    })
    it("should increase the owner's balance with the funds from the lock", async () => {
      const balance = new BigNumber(await web3.eth.getBalance(owner))
      assert(balance.gt(ownerBalance))
    })

    it("should set the lock's balance to 0", async () => {
      assert.equal(await web3.eth.getBalance(locks['OWNED'].address), 0)
    })

    it('should fail if there is nothing left to withdraw', async () => {
      await shouldFail(
        locks['OWNED'].withdraw({
          from: owner,
        }),
        'NOT_ENOUGH_FUNDS'
      )
    })
  })
})
