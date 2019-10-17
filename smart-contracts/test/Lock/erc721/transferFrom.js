const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')

const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../../helpers/proxy')

let unlock, locks

contract('Lock / erc721 / transferFrom', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    await locks['FIRST'].updateTransferFee(0) // disable the transfer fee for this test
    await locks['SINGLE KEY'].updateTransferFee(0) // disable the transfer fee for this test
  })

  const from = accounts[1]
  const to = accounts[2]
  const accountWithNoKey = accounts[3]
  const accountWithKey = accounts[4]
  const accountWithKeyApproved = accounts[5]
  const accountNotApproved = accounts[6]
  const accountApproved = accounts[7]
  const accountWithExpiredKey = accounts[8]
  let keyExpiration
  let ID

  before(() => {
    return Promise.all([
      locks['FIRST'].purchase(
        0,
        accountWithKey,
        web3.utils.padLeft(0, 40),
        [],
        {
          value: Units.convert('0.01', 'eth', 'wei'),
          from: accountWithKey,
        }
      ),
      locks['FIRST'].purchase(0, from, web3.utils.padLeft(0, 40), [], {
        value: Units.convert('0.01', 'eth', 'wei'),
        from,
      }),
      locks['FIRST'].purchase(
        0,
        accountWithExpiredKey,
        web3.utils.padLeft(0, 40),
        [],
        {
          value: Units.convert('0.01', 'eth', 'wei'),
          from: accountWithExpiredKey,
        }
      ),
      locks['FIRST'].purchase(
        0,
        accountWithKeyApproved,
        web3.utils.padLeft(0, 40),
        [],
        {
          value: Units.convert('0.01', 'eth', 'wei'),
          from: accountWithKeyApproved,
        }
      ),
    ]).then(async () => {
      keyExpiration = new BigNumber(
        await locks['FIRST'].keyExpirationTimestampFor.call(from)
      )
    })
  })

  /// @dev Throws unless `msg.sender` is the current owner, an authorized
  ///  operator, or the approved address for this NFT. Throws if `_from` is
  ///  not the current owner. Throws if `_to` is the zero address. Throws if
  ///  `_tokenId` is not a valid NFT.

  describe('when the lock is public', () => {
    it('should abort when there is no key to transfer', async () => {
      await shouldFail(
        locks['FIRST'].transferFrom(accountWithNoKey, to, 999),
        'KEY_NOT_VALID'
      )
    })

    it('should abort if the recipient is 0x', async () => {
      await shouldFail(
        locks['FIRST'].transferFrom(
          from,
          Web3Utils.padLeft(0, 40),
          await locks['FIRST'].getTokenIdFor.call(from),
          {
            from,
          }
        ),
        'INVALID_ADDRESS'
      )
      // Ensuring that ownership of the key did not change
      const expirationTimestamp = new BigNumber(
        await locks['FIRST'].keyExpirationTimestampFor.call(from)
      )
      assert.equal(keyExpiration.toFixed(), expirationTimestamp.toFixed())
    })

    describe('when the recipient already has an expired key', () => {
      it('should transfer the key validity without extending it', async () => {
        // First let's make sure from has a key!
        let fromExpirationTimestamp, ID
        await locks['FIRST'].purchase(0, from, web3.utils.padLeft(0, 40), [], {
          value: Units.convert('0.01', 'eth', 'wei'),
          from,
        })
        // Get the tokenID
        ID = await locks['FIRST'].getTokenIdFor.call(from)
        // Let's check the expiration date for that key
        fromExpirationTimestamp = new BigNumber(
          await locks['FIRST'].keyExpirationTimestampFor.call(from)
        )
        // Then let's expire the key for accountWithExpiredKey
        await locks['FIRST'].expireKeyFor(accountWithExpiredKey)
        await locks['FIRST'].transferFrom(from, accountWithExpiredKey, ID, {
          from,
        })
        const expirationTimestamp = new BigNumber(
          await locks['FIRST'].keyExpirationTimestampFor.call(
            accountWithExpiredKey
          )
        )
        assert.equal(
          expirationTimestamp.toFixed(),
          fromExpirationTimestamp.toFixed()
        )
      })
    })

    describe('when the recipient already has a non expired key', () => {
      let transferedKeyTimestamp
      let previousExpirationTimestamp

      before(async () => {
        await locks['FIRST'].purchase(0, from, web3.utils.padLeft(0, 40), [], {
          value: Units.convert('0.01', 'eth', 'wei'),
          from,
        })
        ID = await locks['FIRST'].getTokenIdFor.call(from)
        // First let's get the current expiration
        transferedKeyTimestamp = new BigNumber(
          await locks['FIRST'].keyExpirationTimestampFor.call(from)
        )
        previousExpirationTimestamp = new BigNumber(
          await locks['FIRST'].keyExpirationTimestampFor.call(accountWithKey)
        )
        await locks['FIRST'].transferFrom(from, accountWithKey, ID, {
          from,
        })
      })

      it("should expand the key's validity", async () => {
        const expirationTimestamp = new BigNumber(
          await locks['FIRST'].keyExpirationTimestampFor.call(accountWithKey)
        )
        const now = Math.floor(new Date().getTime() / 1000)
        // Check +/- 10 seconds
        assert(
          expirationTimestamp.gt(
            previousExpirationTimestamp
              .plus(transferedKeyTimestamp)
              .minus(now + 10)
          )
        )
        assert(
          expirationTimestamp.lt(
            previousExpirationTimestamp
              .plus(transferedKeyTimestamp)
              .minus(now - 10)
          )
        )
      })

      it("should invalidate the previous owner's key", async () => {
        const response = await locks['FIRST'].getHasValidKey.call(from)
        assert.equal(response, false)
      })
    })

    describe('when the key owner is not the sender', async () => {
      it('should fail if the sender has not been approved for that key', async () => {
        const previousExpirationTimestamp = new BigNumber(
          await locks['FIRST'].keyExpirationTimestampFor.call(from)
        )
        await shouldFail(
          locks['FIRST'].transferFrom(from, accountNotApproved, ID, {
            from: accountNotApproved,
          }),
          'KEY_NOT_VALID'
        )
        // Ensuring that ownership of the key did not change
        const expirationTimestamp = new BigNumber(
          await locks['FIRST'].keyExpirationTimestampFor.call(from)
        )
        assert.equal(
          previousExpirationTimestamp.toFixed(),
          expirationTimestamp.toFixed()
        )
      })

      it('should succeed if the sender has been approved for that key', async () => {
        ID = await locks['FIRST'].getTokenIdFor.call(accountWithKeyApproved)
        await locks['FIRST'].approve(accountApproved, ID, {
          from: accountWithKeyApproved,
        })
        await locks['FIRST'].transferFrom(
          accountWithKeyApproved,
          accountApproved,
          ID,
          {
            from: accountApproved,
          }
        )
        let balance = await locks['FIRST'].balanceOf.call(accountApproved)
        assert.equal(balance, 1)
      })

      it('approval should be cleared after a transfer', async () => {
        await shouldFail(
          locks['FIRST'].getApproved(accountApproved),
          'NONE_APPROVED'
        )
      })
    })

    describe('when the key owner is the sender', () => {
      before(async () => {
        // first, let's purchase a brand new key that we can transfer
        await locks['FIRST'].purchase(0, from, web3.utils.padLeft(0, 40), [], {
          value: Units.convert('0.01', 'eth', 'wei'),
          from,
        })
        ID = await locks['FIRST'].getTokenIdFor.call(from)
        keyExpiration = new BigNumber(
          await locks['FIRST'].keyExpirationTimestampFor.call(from)
        )
        await locks['FIRST'].transferFrom(from, to, ID, {
          from,
        })
      })

      it('should mark the previous owner`s key as expired', async () => {
        const expirationTimestamp = new BigNumber(
          await locks['FIRST'].keyExpirationTimestampFor.call(from)
        )
        assert(expirationTimestamp.gt(0))
        assert(expirationTimestamp.lt(keyExpiration))
      })

      it('should have assigned the key`s previous expiration to the new owner', async () => {
        const expirationTimestamp = new BigNumber(
          await locks['FIRST'].keyExpirationTimestampFor.call(to)
        )
        assert.equal(expirationTimestamp.toFixed(), keyExpiration.toFixed())
      })

      it("should no longer associate the transferred tokenId with the previous owner's address", async () => {
        let transferredKeyTokenId = ID
        let ownerOfToken = await locks['FIRST'].ownerOf.call(
          transferredKeyTokenId
        )
        assert.notEqual(from, ownerOfToken)
      })
    })

    describe('when the lock is sold out', () => {
      before(async () => {
        // first we create a lock with only 1 key
        await locks['SINGLE KEY'].purchase(
          0,
          from,
          web3.utils.padLeft(0, 40),
          [],
          {
            value: Units.convert('0.01', 'eth', 'wei'),
            from,
          }
        )
        // confirm that the lock is sold out
        await shouldFail(
          locks['SINGLE KEY'].purchase(
            0,
            accounts[8],
            web3.utils.padLeft(0, 40),
            [],
            {
              value: Units.convert('0.01', 'eth', 'wei'),
              from: accounts[8],
            }
          ),
          'LOCK_SOLD_OUT'
        )
      })

      it('should still allow the transfer of keys', async () => {
        ID = await locks['SINGLE KEY'].getTokenIdFor.call(from)
        let ownerOfBefore = await locks['SINGLE KEY'].ownerOf.call(ID)
        await locks['SINGLE KEY'].transferFrom(ownerOfBefore, accounts[9], ID, {
          from: ownerOfBefore,
        })
        let ownerOfAfter = await locks['SINGLE KEY'].ownerOf.call(ID)
        assert.equal(ownerOfAfter, accounts[9])
      })
    })
  })

  it('can transfer a FREE key', async () => {
    await locks['FREE'].purchase(
      0,
      accounts[1],
      web3.utils.padLeft(0, 40),
      [],
      {
        from: accounts[1],
      }
    )
    let ID = await locks['FREE'].getTokenIdFor.call(accounts[1])
    await locks['FREE'].transferFrom(accounts[1], accounts[2], ID, {
      from: accounts[1],
    })
    let toID = await locks['FREE'].getTokenIdFor.call(accounts[2])
    assert.notEqual(ID, 0)
    assert.equal(ID.toString(), toID.toString())
  })
})
