const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')
const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../helpers/proxy')

let unlock, locks, ID

contract('Lock / disableLock', accounts => {
  let lock
  let keyOwner = accounts[1]
  let keyOwner2 = accounts[2]

  before(async () => {
    unlock = await getUnlockProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks['FIRST']
    await lock.purchaseFor(keyOwner, {
      value: Units.convert('0.01', 'eth', 'wei'),
    })
    await lock.purchaseFor(keyOwner2, {
      value: Units.convert('0.01', 'eth', 'wei'),
    })
    ID = new BigNumber(await lock.getTokenIdFor(keyOwner)).toFixed()
  })

  it('should fail if called by the wrong account', async () => {
    await shouldFail(lock.disableLock({ from: keyOwner }), '')
  })

  it('should fail if called before the lock is disabled', async () => {
    await shouldFail(lock.destroyLock(), 'DISABLE_FIRST')
  })

  describe('when the lock has been disabled', () => {
    let txObj, event
    before(async () => {
      txObj = await lock.disableLock({ from: accounts[0] })
      event = txObj.logs[0]
    })

    it('should trigger the Disable event', () => {
      assert.equal(event.event, 'Disable')
    })

    it('should fail if called while lock is disabled', async () => {
      await shouldFail(lock.disableLock(), 'LOCK_DEPRECATED')
    })

    it('should fail if a user tries to purchase a key', async () => {
      await shouldFail(
        lock.purchaseFor(keyOwner, {
          value: Units.convert('0.01', 'eth', 'wei'),
        }),
        'LOCK_DEPRECATED'
      )
    })

    it('should fail if a user tries to purchase a key with a referral', async () => {
      await shouldFail(
        lock.purchaseForFrom(keyOwner, accounts[3], {
          value: Units.convert('0.01', 'eth', 'wei'),
        }),
        'LOCK_DEPRECATED'
      )
    })

    it('should fail if a user tries to transfer a key', async () => {
      await shouldFail(
        lock.transferFrom(keyOwner, accounts[3], ID, {
          from: keyOwner,
          value: Units.convert('0.01', 'eth', 'wei'),
        }),
        'LOCK_DEPRECATED'
      )
    })

    it('should fail if a key owner tries to a approve an address', async () => {
      await shouldFail(
        lock.approve(accounts[3], ID, {
          from: keyOwner,
        }),
        'LOCK_DEPRECATED'
      )
    })

    it('should still allow access to non-payable contract functions', async () => {
      let HasValidKey = await lock.getHasValidKey.call(keyOwner)
      assert.equal(HasValidKey, true)
    })

    it('Key owners can still cancel for a partial refund', async () => {
      await lock.cancelAndRefund({
        from: keyOwner,
      })
    })

    it('Lock owner can still withdraw', async () => {
      await lock.withdraw(0)
    })

    it('Lock owner can still expireKeyFor', async () => {
      await lock.expireKeyFor(keyOwner2)
    })

    it('Lock owner can still updateLockName', async () => {
      await lock.updateLockName('Hardly')
    })

    it('Lock owner can still updateRefundPenaltyDenominator', async () => {
      await lock.updateRefundPenalty(5, 100)
    })

    it('should fail to setApprovalForAll', async () => {
      await shouldFail(
        lock.setApprovalForAll(accounts[3], true, {
          from: keyOwner,
        }),
        'LOCK_DEPRECATED'
      )
    })

    it('should fail to updateKeyPrice', async () => {
      await shouldFail(lock.updateKeyPrice(1), 'LOCK_DEPRECATED')
    })

    it('should fail to safeTransferFrom w/o data', async () => {
      await shouldFail(
        lock.safeTransferFrom(keyOwner, accounts[3], ID, {
          from: keyOwner,
          value: Units.convert('0.01', 'eth', 'wei'),
        }),
        'LOCK_DEPRECATED'
      )
    })

    it('should fail to safeTransferFrom w/ data', async () => {
      await shouldFail(
        lock.methods['safeTransferFrom(address,address,uint256,bytes)'](
          keyOwner,
          accounts[3],
          ID,
          Web3Utils.toHex('Julien'),
          {
            from: keyOwner,
            value: Units.convert('0.01', 'eth', 'wei'),
          }
        ),
        'LOCK_DEPRECATED'
      )
    })
  })
})
