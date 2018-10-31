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

  describe('getApproved', () => {
    let lockOwner

    before(() => {
      return locks['FIRST'].owner().then((_owner) => {
        lockOwner = _owner
      })
    })

    it('should return the address of the approved owner for a key', () => {
      return locks['FIRST'].approve(accounts[3], accounts[3], {
        from: lockOwner
      }).then(() => {
        return locks['FIRST'].getApproved(accounts[3])
      }).then((approved) => {
        assert.equal(accounts[3], approved)
      })
    })

    it('should fail if no one was approved for a key', () => {
      return locks['FIRST'].getApproved(accounts[1])
        .then(() => {
          assert(false, 'this should have failed')
        })
        .catch(error => {
          assert.equal(error.message, 'VM Exception while processing transaction: revert')
        })
    })
  })
})
