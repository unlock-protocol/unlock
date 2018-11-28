
const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')

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
        locks['FIRST'].purchaseFor(accountWithKey, 'Satoshi', {
          value: Units.convert('0.01', 'eth', 'wei'),
          from: accountWithKey
        }),
        locks['FIRST'].purchaseFor(from, 'Julien', {
          value: Units.convert('0.01', 'eth', 'wei'),
          from
        }),
        locks['FIRST'].purchaseFor(accountWithExpiredKey, 'Finley', {
          value: Units.convert('0.01', 'eth', 'wei'),
          from: accountWithExpiredKey
        }),
        locks['FIRST'].purchaseFor(accountWithKeyApproved, 'Ben', {
          value: Units.convert('0.01', 'eth', 'wei'),
          from: accountWithKeyApproved
        })
      ]).then(() => {
        return locks['FIRST'].keyExpirationTimestampFor(from)
      }).then((expirationTimestamp) => {
        keyExpiration = expirationTimestamp.toNumber()
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
            assert.equal(error.message, 'VM Exception while processing transaction: revert No such key')
          })
      })

      it('should abort if the recipient is 0x', () => {
        return locks['FIRST']
          .transferFrom(from, 0, from, {
            from
          })
          .then(() => {
            assert(false, 'This should not succeed')
          })
          .catch(error => {
            assert.equal(error.message, 'VM Exception while processing transaction: revert')
            // Ensuring that ownership of the key did not change
            return locks['FIRST'].keyExpirationTimestampFor(from)
          }).then((expirationTimestamp) => {
            assert.equal(keyExpiration, expirationTimestamp.toNumber())
          })
      })

      describe('when the recipient already has an expired key', () => {
        it('should transfer the key validity without extending it', () => {
          // First let's make sure from has a key!
          let fromExpirationTimestamp
          return locks['FIRST'].purchaseFor(from, 'Julien', {
            value: Units.convert('0.01', 'eth', 'wei'),
            from
          }).then(() => {
            // Let's check the expiration date for that key
            return locks['FIRST'].keyExpirationTimestampFor(from)
          }).then((_fromExpirationTimestamp) => {
            fromExpirationTimestamp = _fromExpirationTimestamp
            // Then let's expire the key for accountWithExpiredKey
            return locks['FIRST'].expireKeyFor(accountWithExpiredKey)
          }).then(() => {
            return locks['FIRST'].transferFrom(from, accountWithExpiredKey, from, {
              from
            })
          }).then(() => {
            return locks['FIRST'].keyExpirationTimestampFor(accountWithExpiredKey)
          }).then((expirationTimestamp) => {
            assert.equal(expirationTimestamp.toNumber(), fromExpirationTimestamp)
          })
        })
      })

      describe('when the recipient already has a non expired key', () => {
        before(() => {
          return locks['FIRST'].purchaseFor(from, 'Julien', {
            value: Units.convert('0.01', 'eth', 'wei'),
            from
          }).then(() => {
            // First let's get the current expiration
            let previousExpirationTimestamp, transferedKeyTimestamp
            return Promise.all([
              locks['FIRST'].keyExpirationTimestampFor(from),
              locks['FIRST'].keyExpirationTimestampFor(accounts[1])
            ])
          }).then(([_transferedKeyTimestamp, _previousExpirationTimestamp]) => {
            transferedKeyTimestamp = _transferedKeyTimestamp.toNumber()
            previousExpirationTimestamp = _previousExpirationTimestamp.toNumber()
            return locks['FIRST'].transferFrom(from, accountWithKey, from, {
              from
            })
          })
        })

        it('should expand the key\'s validity', () => {
          return locks['FIRST'].keyExpirationTimestampFor(accountWithKey)
            .then((expirationTimestamp) => {
              const now = Math.floor(new Date().getTime() / 1000)
              // Check +/- 10 seconds
              assert(expirationTimestamp.toNumber() > previousExpirationTimestamp + transferedKeyTimestamp - now - 10)
              assert(expirationTimestamp.toNumber() < previousExpirationTimestamp + transferedKeyTimestamp - now + 10)
            })
        })

        it('should expire the previous owner\'s key', () => {
          return locks['FIRST'].keyExpirationTimestampFor(from)
            .then((expirationTimestamp) => {
              const now = Math.floor(new Date().getTime() / 1000)
              // Check only 10 seconds in the future to ensure deterministic test
              assert(expirationTimestamp.toNumber() < now + 10)
            })
        })
      })

      describe('when the key owner is not the sender', () => {
        it('should fail if the sender has not been approved for that key', () => {
          let previousExpirationTimestamp
          return locks['FIRST'].keyExpirationTimestampFor(from)
            .then((_expirationTimestamp) => {
              previousExpirationTimestamp = _expirationTimestamp
              return locks['FIRST']
                .transferFrom(from, accountNotApproved, from, {
                  from: accountNotApproved
                })
            }).then(() => {
              assert(false, 'This should not succeed')
            })
            .catch(error => {
              assert.equal(error.message, 'VM Exception while processing transaction: revert')
              // Ensuring that ownership of the key did not change
              return locks['FIRST'].keyExpirationTimestampFor(from)
            }).then((expirationTimestamp) => {
              assert.equal(previousExpirationTimestamp.toNumber(), expirationTimestamp.toNumber())
            })
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
          return locks['FIRST'].purchaseFor(from, 'Julien', {
            value: Units.convert('0.01', 'eth', 'wei'),
            from
          }).then(() => {
            return locks['FIRST'].keyExpirationTimestampFor(from)
              .then((expirationTimestamp) => {
                keyExpiration = expirationTimestamp.toNumber()
                return locks['FIRST'].transferFrom(from, to, from, {
                  from
                })
              })
          })
        })

        it('should mark the previous owner`s key as expired', () => {
          return locks['FIRST'].keyExpirationTimestampFor(from)
            .then((expirationTimestamp) => {
              assert(expirationTimestamp.toNumber() > 0)
              assert(expirationTimestamp.toNumber() < keyExpiration)
            })
        })

        it('should have assigned the key`s previous expiration to the new owner', () => {
          return locks['FIRST'].keyExpirationTimestampFor(to)
            .then((expirationTimestamp) => {
              assert.equal(expirationTimestamp.toNumber(), keyExpiration)
            })
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
