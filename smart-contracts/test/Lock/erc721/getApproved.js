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
