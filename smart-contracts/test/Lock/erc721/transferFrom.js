const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')

const deployLocks = require('../../helpers/deployLocks')
const Unlock = artifacts.require('../../Unlock.sol')

let unlock, locks

contract('Lock ERC721', (accounts) => {
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

  describe('transferFrom', () => {
    const from = accounts[1]
    const to = accounts[2]
    const accountWithNoKey = accounts[3]
    const accountWithKey = accounts[4]
    const accountWithKeyApproved = accounts[5]
    const accountNotApproved = accounts[6]
    const accountApproved = accounts[7]
    const accountWithExpiredKey = accounts[8]
    const tokenId = from
    let keyExpiration

    before(() => {
      return Promise.all([
        locks['FIRST'].purchaseFor(accountWithKey, Web3Utils.toHex('Satoshi'), {
          value: Units.convert('0.01', 'eth', 'wei'),
          from: accountWithKey
        }),
        locks['FIRST'].purchaseFor(from, Web3Utils.toHex('Julien'), {
          value: Units.convert('0.01', 'eth', 'wei'),
          from
        }),
        locks['FIRST'].purchaseFor(accountWithExpiredKey, Web3Utils.toHex('Finley'), {
          value: Units.convert('0.01', 'eth', 'wei'),
          from: accountWithExpiredKey
        }),
        locks['FIRST'].purchaseFor(accountWithKeyApproved, Web3Utils.toHex('Ben'), {
          value: Units.convert('0.01', 'eth', 'wei'),
          from: accountWithKeyApproved
        })
      ]).then(async () => {
        keyExpiration = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor(from))
      })
    })

    /// @dev Throws unless `msg.sender` is the current owner, an authorized
    ///  operator, or the approved address for this NFT. Throws if `_from` is
    ///  not the current owner. Throws if `_to` is the zero address. Throws if
    ///  `_tokenId` is not a valid NFT.

    describe('when the lock is public', () => {
      it('should abort when there is no key to transfer', () => {
        return locks['FIRST']
          .transferFrom(accountWithNoKey, to, accountWithNoKey, {
            from: accountWithNoKey
          })
          .then(() => {
            assert(false, 'This should not succeed')
          })
          .catch(error => {
            assert.equal(error.message, 'VM Exception while processing transaction: revert Key is not valid')
          })
      })

      it('should abort if the recipient is 0x', async () => {
        try {
          await locks['FIRST'].transferFrom(from, Web3Utils.padLeft(0, 40), from, {
            from
          })
          assert(false, 'This should not succeed')
        } catch(error) {
            assert.equal(error.message, 'VM Exception while processing transaction: revert')
            // Ensuring that ownership of the key did not change
          const expirationTimestamp = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor(from))
          assert.equal(keyExpiration.toFixed(), expirationTimestamp.toFixed())
        }
      })

      describe('when the recipient already has an expired key', () => {
        it('should transfer the key validity without extending it', async () => {
          // First let's make sure from has a key!
          let fromExpirationTimestamp
          await locks['FIRST'].purchaseFor(from, Web3Utils.toHex('Julien'), {
            value: Units.convert('0.01', 'eth', 'wei'),
            from
          })
          // Let's check the expiration date for that key
          fromExpirationTimestamp = await locks['FIRST'].keyExpirationTimestampFor(from)
            // Then let's expire the key for accountWithExpiredKey
          await locks['FIRST'].expireKeyFor(accountWithExpiredKey)
          await locks['FIRST'].transferFrom(from, accountWithExpiredKey, from, {
            from
          })
          const expirationTimestamp = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor(accountWithExpiredKey))
          assert.equal(expirationTimestamp.toFixed(), fromExpirationTimestamp.toFixed())
        })
      })

      describe('when the recipient already has a non expired key', () => {
        before(async () => {
          await locks['FIRST'].purchaseFor(from, Web3Utils.toHex('Julien'), {
            value: Units.convert('0.01', 'eth', 'wei'),
            from
          })
          // First let's get the current expiration
          transferedKeyTimestamp = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor(from))
          previousExpirationTimestamp = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor(accounts[1]))
          await locks['FIRST'].transferFrom(from, accountWithKey, from, {
            from
          })
        })

        it('should expand the key\'s validity', async () => {
          const expirationTimestamp = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor(accountWithKey))
          const now = Math.floor(new Date().getTime() / 1000)
          // Check +/- 10 seconds
          assert(expirationTimestamp.gt(previousExpirationTimestamp.plus(transferedKeyTimestamp).minus(now + 10)))
          assert(expirationTimestamp.lt(previousExpirationTimestamp.plus(transferedKeyTimestamp).minus(now - 10)))
        })

        it('should expire the previous owner\'s key', async () => {
          const expirationTimestamp = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor(from))
          const now = Math.floor(new Date().getTime() / 1000)
          // Check only 10 seconds in the future to ensure deterministic test
          assert(expirationTimestamp.lt(now + 10))
        })
      })

      describe('when the key owner is not the sender', () => {
        it('should fail if the sender has not been approved for that key', async () => {
          const previousExpirationTimestamp = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor(from))
          try {
            await locks['FIRST']
            .transferFrom(from, accountNotApproved, from, {
              from: accountNotApproved
            })
            assert(false, 'This should not succeed')
          } catch(error) {
            assert.equal(error.message, 'VM Exception while processing transaction: revert Key is not valid')
            // Ensuring that ownership of the key did not change
            const expirationTimestamp = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor(from))
            assert.equal(previousExpirationTimestamp.toFixed(), expirationTimestamp.toFixed())
          }
        })

        it('should succeed if the sender has been approved for that key', () => {
          return locks['FIRST']
            .approve(accountApproved, accountWithKeyApproved, {
              from: accountWithKeyApproved
            }).then(() => {
              return locks['FIRST']
                .transferFrom(accountWithKeyApproved, accountApproved, accountWithKeyApproved, {
                  from: accountApproved
                })
                .then(() => {
                  return locks['FIRST']
                    .balanceOf(accountApproved)
                    .then(balance => {
                      assert.equal(balance, 1)
                    })
                })
            })
        })
      })

      describe('when the key owner is the sender', () => {
        before(() => {
          // first, let's purchase a brand new key that we can transfer
          return locks['FIRST'].purchaseFor(from, Web3Utils.toHex('Julien'), {
            value: Units.convert('0.01', 'eth', 'wei'),
            from
          }).then(() => {
            return locks['FIRST'].keyExpirationTimestampFor(from)
              .then((expirationTimestamp) => {
                keyExpiration = expirationTimestamp
                return locks['FIRST'].transferFrom(from, to, from, {
                  from
                })
              })
          })
        })

        it('should mark the previous owner`s key as expired', async () => {
          const expirationTimestamp = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor(from))
          assert(expirationTimestamp.gt(0))
          assert(expirationTimestamp.lt(keyExpiration))
        })

        it('should have assigned the key`s previous expiration to the new owner', async () => {
          const expirationTimestamp = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor(to))
          assert.equal(expirationTimestamp.toFixed(), keyExpiration.toFixed())
        })

        it('should have assigned the key data field to the new owner', () => {
          return locks['FIRST']
            .keyDataFor(to)
            .then(keyData => {
              assert.equal(Web3Utils.toUtf8(keyData), 'Julien')
            })
        })
      })
    })
  })
})
