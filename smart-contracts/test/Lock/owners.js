
const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')

const deployLocks = require('../helpers/deployLocks')
const Unlock = artifacts.require('../Unlock.sol')

let lock

contract('Lock ERC721', (accounts) => {
  before(() => {
    return Unlock.deployed()
      .then(unlock => {
        return deployLocks(unlock)
      })
      .then(locks => {
        lock = locks['FIRST']
      })
  })

  describe('owners', () => {
    before(() => {
      // Purchase keys!
      return Promise.all([
        lock.purchaseFor(accounts[1], 'Julien', {
          value: lock.params.keyPrice,
          from: accounts[0]
        }),
        lock.purchaseFor(accounts[2], 'Ben', {
          value: lock.params.keyPrice,
          from: accounts[0]
        }),
        lock.purchaseFor(accounts[3], 'Satoshi', {
          value: lock.params.keyPrice,
          from: accounts[0]
        }),
        lock.purchaseFor(accounts[4], 'Vitalik', {
          value: lock.params.keyPrice,
          from: accounts[0]
        })
      ])
    })

    it('should have the right number of keys', () => {
      return lock.outstandingKeys().then((outstandingKeys) => {
        assert.equal(outstandingKeys, 4)
      })
    })

    it('should allow for access to an individual key owner', () => {
      return Promise.all([
        lock.owners(0),
        lock.owners(1),
        lock.owners(2),
        lock.owners(3)
      ]).then((owners) => {
        assert.deepEqual(owners.sort(), accounts.slice(1, 5).sort())
      })
    })

    it('should fail to access to an individual key owner when out of bounds', () => {
      return lock.owners(5).then((missing) => {
        assert(false, 'This should have failed')
      }).catch(error => {
        assert.equal(error.message, 'VM Exception while processing transaction: invalid opcode')
      })
    })
  })
})
