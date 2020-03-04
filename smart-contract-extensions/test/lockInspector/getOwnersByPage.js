const { protocols } = require('hardlydifficult-ethereum-contracts')

const LockInspector = artifacts.require('LockInspector.sol')

const keyPrice = web3.utils.toWei('0.01', 'ether')
let lock
let lockInspector

contract('getOwnersByPage', accounts => {
  before(async () => {
    lock = await protocols.unlock.createTestLock(web3, {
      keyPrice,
      from: accounts[1], // Lock owner
    })
    lockInspector = await LockInspector.new()
  })

  describe('when there are 0 key owners', () => {
    it('returns empty results', async () => {
      const results = await lockInspector.getOwnersByPage(lock.address, 0, 2, {
        from: accounts[5],
      })
      assert.equal(results.length, 0)
    })
  })

  describe('when there are less owners than the page size', () => {
    it('should return all of the key owners', async () => {
      await lock.purchase(0, accounts[1], web3.utils.padLeft(0, 40), [], {
        value: keyPrice,
        from: accounts[1],
      })
      let result = await lockInspector.getOwnersByPage(lock.address, 0, 2, {
        from: accounts[0],
      })
      assert.equal(result.length, 1)
      assert.include(result, accounts[1])
    })
  })

  describe('when there are more owners than the page size', () => {
    it('return page size number of key owners', async () => {
      await lock.purchase(0, accounts[1], web3.utils.padLeft(0, 40), [], {
        value: keyPrice,
        from: accounts[1],
      })

      await lock.purchase(0, accounts[2], web3.utils.padLeft(0, 40), [], {
        value: keyPrice,
        from: accounts[2],
      })

      await lock.purchase(0, accounts[3], web3.utils.padLeft(0, 40), [], {
        value: keyPrice,
        from: accounts[3],
      })

      let result = await lockInspector.getOwnersByPage(lock.address, 0, 2, {
        from: accounts[0],
      })
      assert.equal(result.length, 2)
      assert.include(result, accounts[1])
      assert.include(result, accounts[2])
    })
  })

  describe('when requesting a secondary page', () => {
    it('return page size number of key owners', async () => {
      await lock.purchase(0, accounts[1], web3.utils.padLeft(0, 40), [], {
        value: keyPrice,
        from: accounts[1],
      })

      await lock.purchase(0, accounts[2], web3.utils.padLeft(0, 40), [], {
        value: keyPrice,
        from: accounts[2],
      })

      await lock.purchase(0, accounts[3], web3.utils.padLeft(0, 40), [], {
        value: keyPrice,
        from: accounts[3],
      })

      let result = await lockInspector.getOwnersByPage(lock.address, 1, 2, {
        from: accounts[0],
      })
      assert.equal(result.length, 1)
      assert.equal(accounts[3], result[0])
    })
  })
})
