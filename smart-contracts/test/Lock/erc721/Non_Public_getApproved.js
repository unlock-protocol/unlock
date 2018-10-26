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
    // from approve.js, ln# 27:
    it.skip('should return the address of the approved owner for a key', () => {
      return locks['FIRST'].approve(accounts[3], accounts[3], {
        from: lockOwner
      }).then(() => {
        return locks['FIRST'].getApproved(accounts[3])
      }).then((approved) => {
        assert.equal(accounts[3], approved)
      })
    })
  })
})