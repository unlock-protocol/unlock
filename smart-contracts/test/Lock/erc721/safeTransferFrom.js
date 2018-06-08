
const Units = require('ethereumjs-units')

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

  describe('safeTransferFrom', () => {
    it('should abort if the lock is private')
    it('should abort if the lock is permissioned')
    it('should abort when there is no key to transfer')
    it('should abort if the recipient is 0x')
    it('should abort if the recipient already has a key')

    describe('when the key owner is not the sender', () => {
      it('should fail if the sender has not been approved for that key')
      it('should succeed if the sender has been approved for that key')
    })

    describe('when the key owner is the sender', () => {
      it('should succeed even if the recipient of the key has not been approved')
      it('should succeed if the recipient of the key has been approved')
    })

    describe('when transfer was successful', () => {
      it('should mark the previous owner`s key as expired')
      it('should have assigned the key`s previous expiration to the new owner')
      it('should have assigned the key data field to the new owner')
    })

    describe('when transfer failed', () => {
      it('should not have changed the ownership of the key')
    })
  })
})
