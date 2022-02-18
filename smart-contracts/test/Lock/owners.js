const BigNumber = require('bignumber.js')
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
    await lock.purchase(
      0,
      accounts.slice(1, 4),
      [1, 2, 3, 4].map(() => web3.utils.padLeft(0, 40)),
      [1, 2, 3, 4].map(() => web3.utils.padLeft(0, 40)),
      [],
      {
        value: (lock.params.keyPrice * 4).toFixed(),
        from: accounts[0],
      }
    )
  })

  it('should have the right number of keys', async () => {
    const totalSupply = new BigNumber(await lock.totalSupply.call())
    assert.equal(totalSupply.toFixed(), 4)
  })

  it('should have the right number of owners', async () => {
    const numberOfOwners = new BigNumber(await lock.numberOfOwners.call())
    assert.equal(numberOfOwners.toFixed(), 4)
  })

  describe('after a transfer to a new address', () => {
    let numberOfOwners

    before(async () => {
      numberOfOwners = new BigNumber(await lock.numberOfOwners.call())
      let ID = await lock.getTokenIdFor.call(accounts[1])
      await lock.transferFrom(accounts[1], accounts[5], ID, {
        from: accounts[1],
      })
    })

    it('should have the right number of keys', async () => {
      const totalSupply = new BigNumber(await lock.totalSupply.call())
      assert.equal(totalSupply.toFixed(), 4)
    })

    it('should have the right number of owners', async () => {
      const _numberOfOwners = new BigNumber(await lock.numberOfOwners.call())
      assert.equal(_numberOfOwners.toFixed(), numberOfOwners.plus(1).toFixed())
    })

    it('should fail if I transfer from the same account again', async () => {
      await reverts(
        lock.transferFrom(accounts[1], accounts[5], accounts[1], {
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
  describe('after a transfer to a existing owner, buying a key again for someone who already owned one', () => {
    it('should preserve the right number of owners', async () => {
      // initial state
      const numberOfOwners = new BigNumber(await lock.numberOfOwners.call())
      const prevKeyId = await lock.getTokenIdFor.call(accounts[4])
      const totalSupplyBefore = new BigNumber(await lock.totalSupply.call())

      // transfer the key
      await lock.transferFrom(accounts[4], accounts[3], prevKeyId, {
        from: accounts[4],
      })
      assert.equal((await lock.getTokenIdFor.call(accounts[4])).toString(), '0')

      // supply unchanged
      const totalSupplyAfter = new BigNumber(await lock.totalSupply.call())
      assert.equal(totalSupplyBefore.toFixed(), totalSupplyAfter.toFixed())

      // number of owners is identical
      assert.equal(
        numberOfOwners.toFixed(),
        new BigNumber(await lock.numberOfOwners.call()).toFixed()
      )

      // someone buys a key again for the previous owner
      await lock.purchase(
        0,
        [accounts[4]],
        [web3.utils.padLeft(0, 40)],
        [web3.utils.padLeft(0, 40)],
        [],
        {
          value: lock.params.keyPrice.toFixed(),
          from: accounts[4],
        }
      )
      assert.equal((await lock.getTokenIdFor.call(accounts[4])).toNumber(), 5)

      // number of owners should be left unchanged
      const _numberOfOwners = new BigNumber(await lock.numberOfOwners.call())
      assert.equal(_numberOfOwners.toFixed(), numberOfOwners.toFixed())
    })
  })
})
