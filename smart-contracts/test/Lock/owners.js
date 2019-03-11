const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')
const network = 'dev-1984'
const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../helpers/proxy')

let lock, locks, unlock

contract('Lock / owners', accounts => {
  before(async () => {
    unlock = await getUnlockProxy(unlockContract, network)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks['FIRST']
  })

  before(() => {
    // Purchase keys!
    return Promise.all([
      lock.purchaseFor(accounts[1], {
        value: lock.params.keyPrice.toFixed(),
        from: accounts[0]
      }),
      lock.purchaseFor(accounts[2], {
        value: lock.params.keyPrice.toFixed(),
        from: accounts[0]
      }),
      lock.purchaseFor(accounts[3], {
        value: lock.params.keyPrice.toFixed(),
        from: accounts[0]
      }),
      lock.purchaseFor(accounts[4], {
        value: lock.params.keyPrice.toFixed(),
        from: accounts[0]
      })
    ])
  })

  it('should have the right number of keys', async () => {
    const outstandingKeys = new BigNumber(await lock.outstandingKeys.call())
    assert.equal(outstandingKeys.toFixed(), 4)
  })

  it('should have the right number of owners', async () => {
    const numberOfOwners = new BigNumber(await lock.numberOfOwners.call())
    assert.equal(numberOfOwners.toFixed(), 4)
  })

  it('should allow for access to an individual key owner', () => {
    return Promise.all([
      lock.owners.call(0),
      lock.owners.call(1),
      lock.owners.call(2),
      lock.owners.call(3)
    ]).then(owners => {
      assert.deepEqual(owners.sort(), accounts.slice(1, 5).sort())
    })
  })

  it('should fail to access to an individual key owner when out of bounds', async () => {
    await shouldFail(lock.owners.call(6), 'invalid opcode')
  })

  describe('after a transfer to a new address', () => {
    let numberOfOwners

    before(async () => {
      numberOfOwners = new BigNumber(await lock.numberOfOwners.call())
      let ID = await lock.getTokenIdFor.call(accounts[1])
      await lock.transferFrom(accounts[1], accounts[5], ID, {
        from: accounts[1]
      })
    })

    it('should have the right number of keys', async () => {
      const outstandingKeys = new BigNumber(await lock.outstandingKeys.call())
      assert.equal(outstandingKeys.toFixed(), 4)
    })

    it('should have the right number of keys', async () => {
      const outstandingKeys = new BigNumber(await lock.outstandingKeys.call())
      assert.equal(outstandingKeys.toFixed(), 4)
    })

    it('should have the right number of owners', async () => {
      const _numberOfOwners = new BigNumber(await lock.numberOfOwners.call())
      assert.equal(_numberOfOwners.toFixed(), numberOfOwners.plus(1))
    })

    it('should fail if I transfer from the same account again', async () => {
      await shouldFail(
        lock.transferFrom(accounts[1], accounts[5], accounts[1], {
          from: accounts[1]
        }),
        'KEY_NOT_VALID'
      )
    })
  })

  describe('after a transfer to an existing owner', () => {
    let numberOfOwners

    before(async () => {
      numberOfOwners = new BigNumber(await lock.numberOfOwners.call())
      let ID = await lock.getTokenIdFor.call(accounts[2])
      await lock.transferFrom(accounts[2], accounts[3], ID, {
        from: accounts[2]
      })
    })

    it('should have the right number of keys', async () => {
      const outstandingKeys = new BigNumber(await lock.outstandingKeys.call())
      assert.equal(outstandingKeys.toFixed(), 4)
    })

    it('should have the right number of keys', async () => {
      const outstandingKeys = new BigNumber(await lock.outstandingKeys.call())
      assert.equal(outstandingKeys.toFixed(), 4)
    })

    it('should have the right number of owners', async () => {
      const _numberOfOwners = new BigNumber(await lock.numberOfOwners.call())
      assert.equal(_numberOfOwners.toFixed(), numberOfOwners.toFixed())
    })
  })
})
