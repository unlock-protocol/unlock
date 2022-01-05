const BigNumber = require('bignumber.js')

const truffleAssert = require('truffle-assertions')
const { reverts } = require('truffle-assertions')
const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')

let lock
let locks
let unlock

contract('Lock / owners', (accounts) => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    await lock.updateTransferFee(0) // disable the transfer fee for this test
  })

  before(() => {
    // Purchase keys!
    return Promise.all([1,2,3,4].map( d =>
      lock.purchase(
        0,
        accounts[d],
        web3.utils.padLeft(0, 40),
        web3.utils.padLeft(0, 40),
        [],
        {
          value: lock.params.keyPrice.toFixed(),
          from: accounts[0],
        }
      )
    ))
  })

  it('should have the right number of keys', async () => {
    const totalSupply = new BigNumber(await lock.totalSupply.call())
    assert.equal(totalSupply.toFixed(), 4)
  })

  it('should have the right number of owners', async () => {
    const numberOfOwners = new BigNumber(await lock.numberOfOwners.call())
    assert.equal(numberOfOwners.toFixed(), 4)
  })

  it('should allow for access to an individual key owner', async () => {
    const keyIds = [0, 1, 2, 3]
    const owners = await Promise.all(keyIds.map(d => lock.owners.call(d)))
    assert.deepEqual(owners.sort(), accounts.slice(1, 5).sort())
  })

  it('should fail to access to an individual key owner when out of bounds', async () => {
    await truffleAssert.fails(
      lock.owners.call(6),
      'Transaction reverted without a reason string'
    )
  })

  describe('after a transfer to a new address', () => {
    let numberOfOwners

    before(async () => {
      numberOfOwners = new BigNumber(await lock.numberOfOwners.call())
      let ID = await lock.getTokenIdFor.call(accounts[1])
      await lock.transferFrom(accounts[1], accounts[3], ID, {
        from: accounts[1],
      })
    })

    it('should have the right number of keys', async () => {
      const totalSupply = new BigNumber(await lock.totalSupply.call())
      assert.equal(totalSupply.toFixed(), 4)
    })

    it('should have the right number of owners', async () => {
      const _numberOfOwners = new BigNumber(await lock.numberOfOwners.call())
      assert.equal(_numberOfOwners.toFixed(), numberOfOwners.plus(1))
    })

    it('should fail if I transfer from the same account again', async () => {
      await reverts(
        lock.transferFrom(accounts[1], accounts[3], accounts[1], {
          from: accounts[1],
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
        from: accounts[2],
      })
    })

    it('should have the right number of keys', async () => {
      const totalSupply = new BigNumber(await lock.totalSupply.call())
      assert.equal(totalSupply.toFixed(), 4)
    })

    it('should have the right number of owners', async () => {
      const _numberOfOwners = new BigNumber(await lock.numberOfOwners.call())
      assert.equal(_numberOfOwners.toFixed(), numberOfOwners.toFixed())
    })
  })

  // test case proofing https://github.com/code-423n4/2021-11-unlock-findings/issues/120
  describe.only('after a transfer to a existing owner, buying a key again for someone who already owns it', () => {
    it('should preserve the right number of owners', async () => {

      // initial state
      const numberOfOwners = new BigNumber(await lock.numberOfOwners.call())
      const prevKeyId = await lock.getTokenIdFor.call(accounts[4])

      // add key manager
      await lock.setKeyManagerOf(prevKeyId, accounts[9], { from: accounts[4] })

      // manager transfers the key
      await lock.transferFrom(accounts[4], accounts[3], prevKeyId, {
        from: accounts[9],
      })
      assert.equal((await lock.getTokenIdFor.call(accounts[4])).toString(), '0')

      // someone buys a key again for the previous owner
      const tx = await lock.purchase(
        0,
        accounts[4],
        web3.utils.padLeft(0, 40),
        web3.utils.padLeft(0, 40),
        [],
        {
          value: lock.params.keyPrice.toFixed(),
          from: accounts[9],
        }
      )
      assert.equal((await lock.getTokenIdFor.call(accounts[4])).toNumber(), 5)
      
      // number of owners should be left unchanged
      const _numberOfOwners = new BigNumber(await lock.numberOfOwners.call())
      assert.equal(_numberOfOwners.toFixed(), numberOfOwners.toFixed())
    })
  })
})
