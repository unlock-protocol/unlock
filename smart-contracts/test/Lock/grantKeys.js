const Web3Utils = require('web3-utils')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock, lock, locks, tx

contract('Lock / grantKeys', accounts => {
  const lockOwner = accounts[1]
  const keyOwner = accounts[2]
  const validExpirationTimestamp = Math.round(Date.now() / 1000 + 600)

  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, lockOwner)
    lock = locks['FIRST']
  })

  describe('can grant key(s)', () => {
    describe('can grant a key for a new user', () => {
      before(async () => {
        tx = await lock.grantKeys([keyOwner], [validExpirationTimestamp], {
          from: lockOwner,
        })
      })

      it('should log Transfer event', async () => {
        assert.equal(tx.logs[0].event, 'Transfer')
        assert.equal(tx.logs[0].args._from, 0)
        assert.equal(tx.logs[0].args._to, accounts[2])
      })

      it('should acknowledge that user owns key', async () => {
        assert.notEqual(await lock.getTokenIdFor.call(keyOwner), 0)
      })

      it('getHasValidKey is true', async () => {
        assert.equal(await lock.getHasValidKey.call(keyOwner), true)
      })
    })

    describe('can grant a key extension for an existing user', () => {
      const extendedExpiration = validExpirationTimestamp + 100

      before(async () => {
        tx = await lock.grantKeys([keyOwner], [extendedExpiration], {
          from: lockOwner,
        })
      })

      it('should log Transfer event', async () => {
        assert.equal(tx.logs[0].event, 'Transfer')
        assert.equal(tx.logs[0].args._from, 0)
        assert.equal(tx.logs[0].args._to, accounts[2])
      })

      it('should acknowledge that user owns key', async () => {
        assert.notEqual(await lock.getTokenIdFor.call(keyOwner), 0)
      })

      it('getHasValidKey is true', async () => {
        assert.equal(await lock.getHasValidKey.call(keyOwner), true)
      })
    })

    describe('bulk grant keys', () => {
      const keyOwnerList = [accounts[3], accounts[4], accounts[5]]

      it('should fail to grant keys when expiration dates are missing', async () => {
        await shouldFail(
          lock.grantKeys(keyOwnerList, [validExpirationTimestamp], {
            from: lockOwner,
          }),
          'revert'
        )
      })
    })

    it('can bulk grant keys using unique expiration dates', async () => {
      const keyOwnerList = [accounts[6], accounts[7]]
      const expirationDates = [
        validExpirationTimestamp,
        validExpirationTimestamp + 42,
      ]

      before(async () => {
        tx = await lock.methods['grantKeys(uint256[],uint256[])'](
          keyOwnerList,
          expirationDates,
          { from: lockOwner }
        )
      })

      it('should acknowledge that user owns key', async () => {
        for (var i = 0; i < keyOwnerList.length; i++) {
          assert.notEqual(await lock.getTokenIdFor.call(keyOwnerList[i]), 0)
        }
      })

      it('getHasValidKey is true', async () => {
        for (var i = 0; i < keyOwnerList.length; i++) {
          assert.equal(await lock.getHasValidKey.call(keyOwnerList[i]), true)
        }
      })
    })
  })

  describe('should fail', () => {
    it('should fail to revoke a key', async () => {
      await shouldFail(
        lock.grantKeys([keyOwner], [42], { from: lockOwner }),
        'ALREADY_OWNS_KEY'
      )
    })

    it('should fail to grant key to the 0 address', async () => {
      await shouldFail(
        lock.grantKeys([Web3Utils.padLeft(0, 40)], [validExpirationTimestamp], {
          from: lockOwner,
        }),
        'INVALID_ADDRESS'
      )
    })

    it('should fail to reduce the time remaining on a key', async () => {
      await shouldFail(
        lock.grantKeys([keyOwner], [validExpirationTimestamp - 1], {
          from: lockOwner,
        }),
        'ALREADY_OWNS_KEY'
      )
    })

    it('should fail if called by someone other than the owner', async () => {
      await shouldFail(
        lock.grantKeys([keyOwner], [validExpirationTimestamp], {
          from: accounts[0],
        })
      )
    })
  })
})
