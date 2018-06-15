
const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')

const deployLocks = require('../../helpers/deployLocks')
const Unlock = artifacts.require('../../Unlock.sol')

let unlock, locks

contract('Lock ERC721', (accounts) => {
  // Let's build the locks
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
          from: from
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

    it('should abort if the lock is private', () => {
      return locks['PRIVATE']
        .transferFrom(from, to, tokenId, {
          from
        })
        .then(() => {
          assert(false, 'This should not succeed')
        })
        .catch(error => {
          assert.equal(error.message, 'VM Exception while processing transaction: revert')
        })
    })

    it('should abort if the lock is restricted', () => {
      return locks['RESTRICTED']
        .transferFrom(from, to, tokenId, {
          from
        })
        .then(() => {
          assert(false, 'This should not succeed')
        })
        .catch(error => {
          assert.equal(error.message, 'VM Exception while processing transaction: revert')
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
            assert.equal(error.message, 'VM Exception while processing transaction: revert')
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

      it('should abort if the recipient already has a key', () => {
        return locks['FIRST']
          .transferFrom(from, accountWithKey, from, {
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

      describe('when the key owner is not the sender', () => {
        it('should fail if the sender has not been approved for that key', () => {
          return locks['FIRST']
            .transferFrom(from, accountNotApproved, from, {
              from: accountNotApproved
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
          return locks['FIRST'].transferFrom(from, to, from, {
            from
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
