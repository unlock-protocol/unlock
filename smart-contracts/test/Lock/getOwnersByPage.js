const Units = require('ethereumjs-units')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock, locks

contract('Lock / getOwnersByPage', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  describe('when there are 0 key owners', () => {
    it('should return an error', async () => {
      await shouldFail(
        locks['FIRST'].getOwnersByPage.call(0, 2, { from: accounts[5] }),
        'NO_OUTSTANDING_KEYS'
      )
    })
  })

  describe('when there are less owners than the page size', () => {
    it('should return all of the key owners', async () => {
      await locks['FIRST'].purchase(
        0,
        accounts[1],
        web3.utils.padLeft(0, 40),
        [],
        {
          value: Units.convert('0.01', 'eth', 'wei'),
        }
      )
      let result = await locks['FIRST'].getOwnersByPage.call(0, 2, {
        from: accounts[0],
      })
      assert.equal(result.length, 1)
      assert.include(result, accounts[1])
    })
  })

  describe('when there are more owners than the page size', () => {
    it('return page size number of key owners', async () => {
      await locks['FIRST'].purchase(
        0,
        accounts[1],
        web3.utils.padLeft(0, 40),
        [],
        {
          value: Units.convert('0.01', 'eth', 'wei'),
        }
      )

      await locks['FIRST'].purchase(
        0,
        accounts[2],
        web3.utils.padLeft(0, 40),
        [],
        {
          value: Units.convert('0.01', 'eth', 'wei'),
        }
      )

      await locks['FIRST'].purchase(
        0,
        accounts[3],
        web3.utils.padLeft(0, 40),
        [],
        {
          value: Units.convert('0.01', 'eth', 'wei'),
        }
      )

      let result = await locks['FIRST'].getOwnersByPage.call(0, 2, {
        from: accounts[0],
      })
      assert.equal(result.length, 2)
      assert.include(result, accounts[1])
      assert.include(result, accounts[2])
    })
  })

  describe('when requesting a secondary page', () => {
    it('return page size number of key owners', async () => {
      await locks['FIRST'].purchase(
        0,
        accounts[1],
        web3.utils.padLeft(0, 40),
        [],
        {
          value: Units.convert('0.01', 'eth', 'wei'),
        }
      )

      await locks['FIRST'].purchase(
        0,
        accounts[2],
        web3.utils.padLeft(0, 40),
        [],
        {
          value: Units.convert('0.01', 'eth', 'wei'),
        }
      )

      await locks['FIRST'].purchase(
        0,
        accounts[3],
        web3.utils.padLeft(0, 40),
        [],
        {
          value: Units.convert('0.01', 'eth', 'wei'),
        }
      )

      let result = await locks['FIRST'].getOwnersByPage.call(1, 2, {
        from: accounts[0],
      })
      assert.equal(result.length, 1)
      assert.equal(accounts[3], result[0])
    })
  })
})
