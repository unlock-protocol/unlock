const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')
const Web3Utils = require('web3-utils')
const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock, locks

contract('Lock / shareKey', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  let lock, tokenId1, tokenId2, event, event1, event2, tx1, tx2

  const keyOwners = [accounts[1], accounts[2], accounts[3]]
  const keyOwner1 = accounts[1]
  const keyOwner2 = accounts[2]
  const keyOwner3 = accounts[3]
  const accountWithNoKey1 = accounts[4]
  const accountWithNoKey2 = accounts[5]
  const keyPrice = new BigNumber(Units.convert(0.01, 'eth', 'wei'))

  before(async () => {
    lock = locks['FIRST']
    const purchases = keyOwners.map(account => {
      return lock.purchase(0, account, web3.utils.padLeft(0, 40), [], {
        value: keyPrice.toFixed(),
        from: account,
      })
    })
    await Promise.all(purchases)
  })

  describe('failing to share a key', () => {
    describe('not meeting pre-requisites', () => {
      it('sender does not have a key', async () => {
        await shouldFail(
          lock.shareKey(accountWithNoKey1, accounts[7], 11, 1000, {
            from: accountWithNoKey1,
          }),
          'KEY_NOT_VALID'
        )
      })

      it('called by other than keyOwner or approved ', async () => {
        await shouldFail(
          lock.shareKey(
            keyOwners[0],
            accounts[3],
            await lock.getTokenIdFor.call(keyOwners[0]),
            1000,
            {
              from: accounts[6],
            }
          ),
          'ONLY_KEY_OWNER_OR_APPROVED'
        )
      })

      it('should abort if the recipient is 0x', async () => {
        await shouldFail(
          lock.shareKey(
            keyOwners[0],
            Web3Utils.padLeft(0, 40),
            await lock.getTokenIdFor.call(keyOwners[0]),
            1000,
            {
              from: keyOwners[0],
            }
          ),
          'INVALID_ADDRESS'
        )
      })
    })

    describe('fallback behaviors', () => {
      it('transfers all remaining time if amount to share >= remaining time', async () => {
        let tooMuchTime = new BigNumber(60 * 60 * 24 * 30 * 2) // 60 days
        tokenId1 = await lock.getTokenIdFor.call(keyOwner1)
        assert.equal(await lock.getHasValidKey.call(keyOwner1), true)
        tx1 = await lock.shareKey(
          keyOwner1,
          accountWithNoKey1,
          tokenId1,
          tooMuchTime,
          {
            from: keyOwner1,
          }
        )
        let actualTimeShared = tx1.logs[1].args._amount.toNumber(10)
        assert.equal(await lock.getHasValidKey.call(accountWithNoKey1), true) // new owner now has a fresh key
        let newExpirationTimestamp = new BigNumber(
          await lock.keyExpirationTimestampFor.call(accountWithNoKey1)
        )
        let blockTimestampAfter = new BigNumber(
          (await web3.eth.getBlock('latest')).timestamp
        )
        assert(
          newExpirationTimestamp.minus(blockTimestampAfter).eq(actualTimeShared)
        )
      })

      it('should emit the expireKey Event', async () => {
        assert.equal(tx1.logs[0].event, 'ExpireKey')
      })

      it('The origin key is expired', async () => {
        assert.equal(await lock.getHasValidKey.call(keyOwner1), false)
      })

      it('The original owner still owns their key', async () => {
        assert.equal(await lock.isKeyOwner.call(tokenId1, keyOwner1), true)
      })
    })
  })
  describe('successful key sharing', () => {
    let oneDay = new BigNumber(60 * 60 * 24)
    let hadKeyBefore,
      expirationBeforeSharing,
      expirationAfterSharing,
      sharedKeyExpiration,
      fee,
      timestampBeforeSharing,
      timestampAfterSharing

    before(async () => {
      // Change the fee to 5%
      await lock.updateTransferFee(500)
      hadKeyBefore = await lock.getHasValidKey.call(accountWithNoKey2)
      expirationBeforeSharing = new BigNumber(
        await lock.keyExpirationTimestampFor.call(keyOwner2)
      )
      timestampBeforeSharing = new BigNumber(
        (await web3.eth.getBlock('latest')).timestamp
      )
      fee = new BigNumber(await lock.getTransferFee.call(keyOwner2, oneDay))
      tokenId2 = await lock.getTokenIdFor.call(keyOwner2)
      tx2 = await lock.shareKey(
        keyOwner2,
        accountWithNoKey2,
        tokenId2,
        oneDay,
        {
          from: keyOwner2,
        }
      )
      event = tx2.logs[0].event
      event1 = tx2.logs[1].event
      event2 = tx2.logs[2].event
    })

    it('should emit the TimestampChanged event twice', async () => {
      assert.equal(event, 'TimestampChanged')
      assert.equal(tx2.logs[0].args._timeAdded, false)
      assert.equal(event1, 'TimestampChanged')
      assert.equal(tx2.logs[1].args._timeAdded, true)
    })

    it('should emit the Transfer event', async () => {
      assert.equal(event2, 'Transfer')
    })

    it('should subtract the time shared + fee from keyOwner', async () => {
      expirationAfterSharing = new BigNumber(
        await lock.keyExpirationTimestampFor.call(keyOwner2)
      )
      assert(
        expirationAfterSharing.eq(
          expirationBeforeSharing.minus(fee).minus(oneDay)
        )
      )
    })

    it('should create a new key and add the time shared to it', async () => {
      sharedKeyExpiration = new BigNumber(
        await lock.keyExpirationTimestampFor.call(accountWithNoKey2)
      )
      let currentTimestamp = new BigNumber(
        (await web3.eth.getBlock('latest')).timestamp
      )
      assert.equal(hadKeyBefore, false)
      assert.equal(await lock.getHasValidKey.call(accountWithNoKey2), true)
      assert(sharedKeyExpiration.eq(currentTimestamp.plus(oneDay)))
    })

    it('total time remaining is <= original time + fee', async () => {
      timestampAfterSharing = new BigNumber(
        (await web3.eth.getBlock('latest')).timestamp
      )
      let timeRemainingBefore = expirationBeforeSharing.minus(
        timestampBeforeSharing
      )
      let totalTimeRemainingAfter = expirationAfterSharing
        .minus(timestampAfterSharing)
        .plus(sharedKeyExpiration.minus(timestampAfterSharing))

      assert(timeRemainingBefore.minus(fee).gte(totalTimeRemainingAfter))
    })

    it('should extend the key of an existing owner', async () => {
      let oldExistingKeyExpiration = new BigNumber(
        await lock.keyExpirationTimestampFor.call(keyOwner3)
      )
      await lock.shareKey(keyOwner2, keyOwner3, tokenId2, oneDay, {
        from: keyOwner2,
      })
      let newExistingKeyExpiration = new BigNumber(
        await lock.keyExpirationTimestampFor.call(keyOwner3)
      )
      assert(newExistingKeyExpiration.eq(oldExistingKeyExpiration.plus(oneDay)))
    })
  })
})
