const truffleAssert = require('truffle-assertions')
const { reverts } = require('truffle-assertions')
const BigNumber = require('bignumber.js')
const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock
let lock
let locks
let tx

contract('Lock / grantKeys', accounts => {
  const lockCreator = accounts[1]
  const keyOwner = accounts[2]
  let validExpirationTimestamp

  before(async () => {
    validExpirationTimestamp = Math.round(Date.now() / 1000 + 600)
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, lockCreator)
    lock = locks.FIRST
  })

  describe('can grant key(s)', () => {
    describe('can grant a key for a new user', () => {
      let iD

      before(async () => {
        // the lock creator is assigned the KeyGranter role by default
        let hasKey = await lock.getHasValidKey.call(keyOwner)
        assert.equal(hasKey, false)
        tx = await lock.grantKeys(
          [keyOwner],
          [validExpirationTimestamp],
          [lockCreator],
          {
            from: lockCreator,
          }
        )
        iD = new BigNumber(await lock.getTokenIdFor(keyOwner))
      })

      it('should log the KeyManagerChanged event', async () => {
        assert.equal(tx.logs[0].event, 'KeyManagerChanged')
        assert(new BigNumber(tx.logs[0].args._tokenId).eq(iD))
        assert.equal(tx.logs[0].args._newManager, lockCreator)
      })

      it('should log the Transfer event', async () => {
        assert.equal(tx.logs[1].event, 'Transfer')
        assert.equal(tx.logs[1].args.from, 0)
        assert.equal(tx.logs[1].args.to, accounts[2])
      })

      it('should acknowledge that user owns key', async () => {
        assert.notEqual(await lock.getTokenIdFor.call(keyOwner), 0)
      })

      it('getHasValidKey is true', async () => {
        assert.equal(await lock.getHasValidKey.call(keyOwner), true)
      })
    })

    describe('can grant a key extension for an existing user', () => {
      let extendedExpiration

      before(async () => {
        extendedExpiration = validExpirationTimestamp + 100
        tx = await lock.grantKeys(
          [keyOwner],
          [extendedExpiration],
          [lockCreator],
          {
            from: lockCreator,
          }
        )
      })

      it('should log Transfer event', async () => {
        assert.equal(tx.logs[0].event, 'Transfer')
        assert.equal(tx.logs[0].args.from, 0)
        assert.equal(tx.logs[0].args.to, accounts[2])
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
        await truffleAssert.fails(
          lock.grantKeys(
            keyOwnerList,
            [validExpirationTimestamp],
            [lockCreator],
            {
              from: lockCreator,
            }
          ),
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
          [lockCreator],
          { from: lockCreator }
        )
      })

      it('should acknowledge that user owns key', async () => {
        for (let i = 0; i < keyOwnerList.length; i++) {
          assert.notEqual(await lock.getTokenIdFor.call(keyOwnerList[i]), 0)
        }
      })

      it('getHasValidKey is true', async () => {
        for (let i = 0; i < keyOwnerList.length; i++) {
          assert.equal(await lock.getHasValidKey.call(keyOwnerList[i]), true)
        }
      })
    })
  })

  describe('should fail', () => {
    it('should fail to revoke a key', async () => {
      await reverts(
        lock.grantKeys([keyOwner], [42], [lockCreator], { from: lockCreator }),
        'ALREADY_OWNS_KEY'
      )
    })

    it('should fail to grant key to the 0 address', async () => {
      await reverts(
        lock.grantKeys(
          [web3.utils.padLeft(0, 40)],
          [validExpirationTimestamp],
          [web3.utils.padLeft(0, 40)],
          {
            from: lockCreator,
          }
        ),
        'INVALID_ADDRESS'
      )
    })

    it('should fail to reduce the time remaining on a key', async () => {
      await reverts(
        lock.grantKeys(
          [keyOwner],
          [validExpirationTimestamp - 1],
          [lockCreator],
          {
            from: lockCreator,
          }
        ),
        'ALREADY_OWNS_KEY'
      )
    })

    it('should fail if called by someone other than the owner', async () => {
      await reverts(
        lock.grantKeys([keyOwner], [validExpirationTimestamp], [lockCreator], {
          from: accounts[0],
        })
      )
    })

    it('should not let the keyGranter overwrite the keyManager for valid keys', async () => {
      const keyPrice = new BigNumber(web3.utils.toWei('0.01', 'ether'))
      await lock.purchase(0, accounts[7], web3.utils.padLeft(0, 40), [], {
        value: keyPrice.toFixed(),
        from: accounts[7],
      })
      assert.equal(await lock.getHasValidKey.call(accounts[7]), true)
      const iD = await lock.getTokenIdFor(accounts[7])
      const newTimestamp = Math.round(Date.now() / 1000 + 60 * 60 * 24 * 30)
      const originalKeyManager = await lock.getKeyManagerOf(iD)
      assert.notEqual(originalKeyManager, lockCreator)
      // lockCreator attenpts to set herself as the keyManager
      await lock.grantKeys([keyOwner], [newTimestamp], [lockCreator], {
        from: lockCreator,
      })
      const newKeyManager = await lock.getKeyManagerOf(iD)
      assert.equal(originalKeyManager, newKeyManager)
    })
  })
})
