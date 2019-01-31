const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')
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
        lock.purchaseFor(accounts[1], Web3Utils.toHex('Julien'), {
          value: lock.params.keyPrice.toFixed(),
          from: accounts[0]
        }),
        lock.purchaseFor(accounts[2], Web3Utils.toHex('Ben'), {
          value: lock.params.keyPrice.toFixed(),
          from: accounts[0]
        }),
        lock.purchaseFor(accounts[3], Web3Utils.toHex('Satoshi'), {
          value: lock.params.keyPrice.toFixed(),
          from: accounts[0]
        }),
        lock.purchaseFor(accounts[4], Web3Utils.toHex('Vitalik'), {
          value: lock.params.keyPrice.toFixed(),
          from: accounts[0]
        })
      ])
    })

    it('should have the right number of keys', () => {
      return lock.outstandingKeys().then((outstandingKeys) => {
        assert.equal(outstandingKeys, 4)
      })
    })

    it('should have the right number of owners', () => {
      return lock.numberOfOwners.call().then((numberOfOwners) => {
        assert.equal(numberOfOwners, 4)
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

    it('should fail to access to an individual key owner when out of bounds', async () => {
      await shouldFail(lock.owners(6), 'invalid opcode')
    })

    describe('after a transfer to a new address', () => {
      let numberOfOwners

      before(async () => {
        numberOfOwners = new BigNumber(await lock.numberOfOwners.call())
        await lock.transferFrom(accounts[1], accounts[5], accounts[1], { from: accounts[1] })
      })

      it('should have the right number of keys', () => {
        return lock.outstandingKeys().then((outstandingKeys) => {
          assert.equal(outstandingKeys, 4)
        })
      })

      it('should have the right number of owners', async () => {
        const _numberOfOwners = new BigNumber(await lock.numberOfOwners.call())
        assert.equal(_numberOfOwners.toFixed(), numberOfOwners.plus(1))
      })

      it('should fail if I transfer from the same account again', async () => {
        await shouldFail(lock.transferFrom(accounts[1], accounts[5], accounts[1], { from: accounts[1] }),
          'Key is not valid')
      })
    })

    describe('after a transfer to an existing owner', () => {
      let numberOfOwners

      before(async () => {
        numberOfOwners = await lock.numberOfOwners.call()
        await lock.transferFrom(accounts[2], accounts[3], accounts[2], { from: accounts[2] })
      })

      it('should have the right number of keys', () => {
        return lock.outstandingKeys().then((outstandingKeys) => {
          assert.equal(outstandingKeys, 4)
        })
      })

      it('should have the right number of owners', async () => {
        const _numberOfOwners = new BigNumber(await lock.numberOfOwners.call())
        assert.equal(_numberOfOwners.toFixed(), numberOfOwners)
      })
    })
  })
})
