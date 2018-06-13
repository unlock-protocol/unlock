
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

  describe('approve', () => {
    describe('when the lock is private', () => {
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

    describe('when the lock is permissioned', () => {
      it('should fail', () => {
        return locks['RESTRICTED']
          .approve(accounts[2], accounts[1], {
            from: accounts[1]
          })
          .catch(error => {
            assert.equal(error.message, 'VM Exception while processing transaction: revert')
          })
      })
    })

    describe('when the token does not exist', () => {
      it('should fail', () => {
        return locks['FIRST']
          .approve(accounts[2], accounts[1], {
            from: accounts[1]
          })
          .catch(error => {
            assert.equal(error.message, 'VM Exception while processing transaction: revert')
          })
      })
    })

    describe('when the key exists', () => {
      before(() => {
        return locks['FIRST'].purchase('Satoshi', {
          value: Units.convert('0.01', 'eth', 'wei'),
          from: accounts[1]
        })
      })

      describe('when the sender is not the token owner', () => {
        it('should fail', () => {
          return locks['FIRST']
            .approve(accounts[2], accounts[1], {
              from: accounts[2]
            })
            .catch(error => {
              assert.equal(error.message, 'VM Exception while processing transaction: revert')
            })
        })
      })

      describe('when the sender is self approving', () => {
        it('should fail', () => {
          return locks['FIRST']
            .approve(accounts[1], accounts[1], {
              from: accounts[1]
            })
            .catch(error => {
              assert.equal(error.message, 'VM Exception while processing transaction: revert')
            })
        })
      })

      describe('when the approval succeeds', () => {
        let event
        before(() => {
          return locks['FIRST']
            .approve(accounts[2], accounts[1], {
              from: accounts[1]
            })
            .then((result) => {
              event = result.logs[0]
            })
        })

        it('should assign the approvedForTransfer value', () => {
          return locks['FIRST'].getApproved(accounts[1])
            .then((approved) => {
              assert.equal(approved, accounts[2])
            })
        })

        it('should trigger the Approval event', () => {
          assert.equal(event.event, 'Approval')
          assert.equal(event.args._owner, accounts[1])
          assert.equal(event.args._approved, accounts[2])
          assert.equal(Web3Utils.numberToHex(event.args._tokenId), accounts[1])
        })
      })
    })
  })
})
