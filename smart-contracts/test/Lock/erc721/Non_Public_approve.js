
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

  // from approve.js, ln#23:
  describe.skip('when the lock is private', () => {
    it('should fail', () => {
      return locks['PRIVATE']
        .approve(accounts[2], accounts[1], {
          from: accounts[1]
        })
        .catch(error => {
          assert.equal(error.message, 'VM Exception while processing transaction: revert')
        })
    })
  })

  describe.skip('when the lock is permissioned', () => {
    let owner

    before(() => {
      return locks['RESTRICTED'].owner().then((_owner) => {
        owner = _owner
      })
    })

    describe.skip('if the sender is the owner of the lock', () => {
      it('should allow the owner of the lock to approve a purchase by setting the the _tokenId to the same value as the _approved', () => {
        return locks['RESTRICTED']
          .approve(accounts[1], accounts[1], {
            from: owner
          })
          .then(() => {
            return locks['RESTRICTED'].getApproved(accounts[1])
          })
          .then((approved) => {
            assert.equal(approved, accounts[1])
          })
      })

      it('should allow the owner of the lock to approve a transfer of an existing key', () => {
        return locks['RESTRICTED']
          .approve(accounts[2], accounts[2], {
            from: owner
          })
          .then(() => {
            // accounts[2] purchases a key
            return locks['RESTRICTED'].purchaseFor(accounts[2], 'Julien', {
              value: locks['RESTRICTED'].params.keyPrice,
              from: accounts[2]
            })
          })
          .then(() => {
            // Lock owner approves the transfer of accounts[2]'s key
            return locks['RESTRICTED']
              .approve(accounts[3], accounts[2], {
                from: owner
              })
          })
          .then(() => {
            // Let's retrieve the approved key
            return locks['RESTRICTED'].getApproved(accounts[2])
          })
          .then((approved) => {
            // and make sure it is right
            assert.equal(approved, accounts[3])
          })
      })

      it('should allow the owner of the lock to approve a transfer of a non existing key', () => {
        return locks['RESTRICTED']
          .approve(accounts[4], accounts[5], {
            from: owner
          })
          .then(() => {
            // Let's retrieve the approved key
            return locks['RESTRICTED'].getApproved(accounts[5])
          })
          .then((approved) => {
            // and make sure it is right
            assert.equal(approved, accounts[4])
          })
      })
    })

    describe.skip('if the sender is the owner of the key', () => {
      it('should fail if the owner of a key tries to approve transfer of her key', () => {
        return locks['RESTRICTED']
          .approve(accounts[5], accounts[5], {
            from: owner
          })
          .then(() => {
            // accounts[5] purchases a key
            return locks['RESTRICTED'].purchaseFor(accounts[5], 'Julien', {
              value: locks['RESTRICTED'].params.keyPrice,
              from: accounts[5]
            })
          })
          .then(() => {
            // Key owner tries to approve the transfer of her key
            return locks['RESTRICTED']
              .approve(accounts[3], accounts[5], {
                from: accounts[5]
              })
          })
          .then(() => {
            assert(false, 'this should have failed')
          })
          .catch(error => {
            assert.equal(error.message, 'VM Exception while processing transaction: revert')
          })
      })

      it('should fail if sender is trying to allow another key transfer', () => {
        return locks['RESTRICTED']
          .approve(accounts[5], accounts[5], {
            from: owner
          })
          .then(() => {
            // accounts[5] purchases a key
            return locks['RESTRICTED'].purchaseFor(accounts[5], 'Julien', {
              value: locks['RESTRICTED'].params.keyPrice,
              from: accounts[5]
            })
          })
          .then(() => {
            // Key owner tries to approve the transfer of her key
            return locks['RESTRICTED']
              .approve(accounts[3], accounts[4], {
                from: accounts[5]
              })
          })
          .then(() => {
            assert(false, 'this should have failed')
          })
          .catch(error => {
            assert.equal(error.message, 'VM Exception while processing transaction: revert')
          })
      })
    })

    it('should fail if the sender does not own a key', () => {
      return locks['RESTRICTED']
        .approve(accounts[5], accounts[5], {
          from: accounts[9]
        })
        .then(() => {
          assert(false, 'this should have failed')
        })
        .catch(error => {
          assert.equal(error.message, 'VM Exception while processing transaction: revert')
        })
    })
  })
})
