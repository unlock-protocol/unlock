
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

  describe('getApproved', () => {
    describe('when the lock is private', () => {
      it('should fail', () => {
        return locks['PRIVATE']
          .getApproved(accounts[3])
          .catch(error => {
            assert.equal(error.message, 'VM Exception while processing transaction: revert')
          })
      })
    })

    describe('when the lock is permissioned', () => {
      it('should fail', () => {
        return locks['RESTRICTED']
          .getApproved(accounts[3])
          .catch(error => {
            assert.equal(error.message, 'VM Exception while processing transaction: revert')
          })
      })
    })

    describe('when the lock is public', () => {
      describe('when there is no such key to be transfered', () => {
        it('should fail', () => {
          return locks['FIRST']
            .getApproved(accounts[3])
            .catch(error => {
              assert.equal(error.message, 'VM Exception while processing transaction: revert')
            })
        })
      })

      describe('when there is a key', () => {
        before(() => {
          return locks['FIRST'].purchase('Satoshi', {
            value: Units.convert('0.01', 'eth', 'wei'),
            from: accounts[1]
          })
        })

        describe('when the key has been approved for transfer', () => {
          it('should fail if the recipient of the approval is not the right address', () => {
            return locks['FIRST']
              .approve(
                accounts[2],
                accounts[1], {
                  from: accounts[1]
                })
              .then(() => {
                return locks['FIRST']
                  .getApproved(accounts[3])
                  .catch(error => {
                    assert.equal(error.message, 'VM Exception while processing transaction: revert')
                  })
              })
          })

          it('should succeed if the recipient of the approval is the right address', () => {
            return locks['FIRST']
              .approve(accounts[2], accounts[1], {
                from: accounts[1]
              })
              .then(() => {
                return locks['FIRST']
                  .getApproved(accounts[2])
                  .catch(error => {
                    assert.equal(error.message, 'VM Exception while processing transaction: revert')
                  })
              })
          })
        })

        describe('when the key has not been approved for transfer', () => {
          it('should fail', () => {
            return locks['FIRST']
              .getApproved(accounts[1])
              .catch(error => {
                assert.equal(error.message, 'VM Exception while processing transaction: revert')
              })
          })
        })
      })
    })
  })
})
