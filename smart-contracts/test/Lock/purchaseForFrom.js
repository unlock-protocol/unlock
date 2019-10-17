const Units = require('ethereumjs-units')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock, locks

contract('Lock / purchaseForFrom', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  describe('if the referrer does not have a key', () => {
    it.skip('should fail', async () => {
      // TODO this now falls back to no referral, but allow the purchase
      const lock = locks['FIRST']
      await shouldFail(
        lock.purchase(0, accounts[0], accounts[1], []),
        'KEY_NOT_VALID'
      )
      // Making sure we do not have a key set!
      await shouldFail(
        lock.keyExpirationTimestampFor.call(accounts[0]),
        'HAS_NEVER_OWNED_KEY'
      )
    })
  })

  describe('if the referrer has a key', () => {
    it('should succeed', () => {
      const lock = locks['FIRST']
      return lock
        .purchase(0, accounts[0], web3.utils.padLeft(0, 40), [], {
          value: Units.convert('0.01', 'eth', 'wei'),
        })
        .then(() => {
          return lock.purchase(0, accounts[1], accounts[0], [], {
            value: Units.convert('0.01', 'eth', 'wei'),
          })
        })
    })

    it('can purchaseForFrom a free key', async () => {
      await locks['FREE'].purchase(
        0,
        accounts[0],
        web3.utils.padLeft(0, 40),
        []
      )
      const tx = await locks['FREE'].purchase(0, accounts[2], accounts[0], [])
      assert.equal(tx.logs[0].event, 'Transfer')
      assert.equal(tx.logs[0].args._from, 0)
      assert.equal(tx.logs[0].args._to, accounts[2])
    })
  })
})
