const { reverts } = require('truffle-assertions')
const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock
let locks

contract('Lock / getOwnersByPage', (accounts) => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  describe('when there are no owners', () => {
    it('should return an empty array', async () => {
      // when _page = 0 this returns an empty array
      const result = await locks.FIRST.getOwnersByPage.call(0, 10, {
        from: accounts[0],
      })
      assert.equal(result.length, 0)
    })

    it('should revert', async () => {
      // when _page > 0 this reverts
      await reverts(
        locks.FIRST.getOwnersByPage.call(1, 1, {
          from: accounts[0],
        }),
        'VM Exception while processing transaction: reverted with panic code 0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)'
      )
    })
  })

  describe('when there are less owners than the page size', () => {
    it('should return all of the key owners', async () => {
      await locks.FIRST.purchase(
        0,
        accounts[1],
        web3.utils.padLeft(0, 40),
        [],
        {
          value: web3.utils.toWei('0.01', 'ether'),
        }
      )
      let result = await locks.FIRST.getOwnersByPage.call(0, 2, {
        from: accounts[0],
      })
      assert.equal(result.length, 1)
      assert.include(result, accounts[1])
    })
  })

  describe('when there are more owners than the page size', () => {
    it('return page size number of key owners', async () => {
      await locks.FIRST.purchase(
        0,
        accounts[1],
        web3.utils.padLeft(0, 40),
        [],
        {
          value: web3.utils.toWei('0.01', 'ether'),
        }
      )

      await locks.FIRST.purchase(
        0,
        accounts[2],
        web3.utils.padLeft(0, 40),
        [],
        {
          value: web3.utils.toWei('0.01', 'ether'),
        }
      )

      await locks.FIRST.purchase(
        0,
        accounts[3],
        web3.utils.padLeft(0, 40),
        [],
        {
          value: web3.utils.toWei('0.01', 'ether'),
        }
      )

      let result = await locks.FIRST.getOwnersByPage.call(0, 2, {
        from: accounts[0],
      })
      assert.equal(result.length, 2)
      assert.include(result, accounts[1])
      assert.include(result, accounts[2])
    })
  })

  describe('when requesting a secondary page', () => {
    it('return page size number of key owners', async () => {
      await locks.FIRST.purchase(
        0,
        accounts[1],
        web3.utils.padLeft(0, 40),
        [],
        {
          value: web3.utils.toWei('0.01', 'ether'),
        }
      )

      await locks.FIRST.purchase(
        0,
        accounts[2],
        web3.utils.padLeft(0, 40),
        [],
        {
          value: web3.utils.toWei('0.01', 'ether'),
        }
      )

      await locks.FIRST.purchase(
        0,
        accounts[3],
        web3.utils.padLeft(0, 40),
        [],
        {
          value: web3.utils.toWei('0.01', 'ether'),
        }
      )

      let result = await locks.FIRST.getOwnersByPage.call(1, 2, {
        from: accounts[0],
      })
      assert.equal(result.length, 1)
      assert.equal(accounts[3], result[0])
    })
  })
})
