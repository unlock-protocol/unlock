// a further PR will uncomment the lines below and add more tests.
// const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../../helpers/proxy')

let unlock //, lock

contract('Lock / erc721 / tokenSymbol', accounts => {
  before(async () => {
    unlock = await getUnlockProxy(unlockContract)

    // const locks = await deployLocks(unlock, accounts[0])
    // lock = locks['FIRST']
  })

  describe('the global token symbol stored in Unlock', () => {
    let txObj, event

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

    it('should emit the NewTokenSymbol event', async () => {
      assert.equal(event.event, 'NewTokenSymbol')
    })
  })
})
