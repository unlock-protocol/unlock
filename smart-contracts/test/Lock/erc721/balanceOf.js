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

  describe('balanceOf', () => {
    it('should return 0 if the user has no key', () => {
      return locks['FIRST']
        .balanceOf(accounts[3])
        .then(balance => {
          assert.equal(balance.toNumber(), 0)
        })
    })

    it('should return 1 if the user has a non expired key', () => {
      return locks['FIRST'].purchase('Satoshi', {
        value: Units.convert('0.01', 'eth', 'wei'),
        from: accounts[1]
      }).then(() => {
        return locks['FIRST'].balanceOf(accounts[1])
      }).then(balance => {
        assert.equal(balance.toNumber(), 1)
      })
    })

    it('should return 1 if the user has an expired key')
  })
})
