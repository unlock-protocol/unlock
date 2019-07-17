const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../../helpers/proxy')

let unlock, lock, txObj, event

contract('Lock / erc721 / tokenSymbol', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)

    const locks = await deployLocks(unlock, accounts[0])
    lock = locks['FIRST']
  })

  describe('the global token symbol stored in Unlock', () => {
    it('should return the global token symbol', async () => {
      assert.equal(await unlock.getGlobalTokenSymbol.call(), '')
    })

    it('should allow the owner to set the global token Symbol', async () => {
      txObj = await unlock.setGlobalTokenSymbol('KEY', {
        from: accounts[0],
      })
      event = txObj.logs[0]
      assert.equal(await unlock.getGlobalTokenSymbol.call(), 'KEY')
    })

    it('should fail if someone other than the owner tries to set the symbol', async () => {
      await shouldFail(
        unlock.setGlobalBaseTokenURI('BTC', {
          from: accounts[1],
        })
      )
    })

    it('should emit the NewGlobalTokenSymbol event', async () => {
      assert.equal(event.event, 'NewGlobalTokenSymbol')
    })
  })

  describe('A custom token symbol stored in the lock', () => {
    it('should allow the lock owner to set a custom token symbol', async () => {
      txObj = await lock.updateLockSymbol('MYTKN', { from: accounts[0] })
      event = txObj.logs[0]
      assert.equal(await lock.symbol.call(), 'MYTKN')
    })

    it('should fail if someone other than the owner tries to set the symbol', async () => {
      await shouldFail(
        lock.updateLockSymbol('BTC', {
          from: accounts[1],
        })
      )
    })

    it('should emit the NewLockSymbol event', async () => {
      assert.equal(event.event, 'NewLockSymbol')
    })
  })
})
