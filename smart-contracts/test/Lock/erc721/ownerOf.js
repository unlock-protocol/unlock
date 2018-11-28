
const Units = require('ethereumjs-units')

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

  describe('ownerOf', () => {
    it('should abort when the key has no owner', () => {
      return locks['FIRST']
        .ownerOf(accounts[3])
        .then(balance => {
          assert(false)
        })
        .catch(error => {
          assert.equal(error.message, 'VM Exception while processing transaction: revert No such key')
        })
    })

    it('should return the owner of the key', () => {
      return locks['FIRST'].purchaseFor(accounts[1], 'Satoshi', {
        value: Units.convert('0.01', 'eth', 'wei'),
        from: accounts[1]
      }).then(() => {
        return locks['FIRST'].ownerOf(accounts[1])
      }).then(address => {
        assert.equal(address, accounts[1])
      })
    })
  })
})
