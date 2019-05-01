// a further PR will uncomment the lines below and add more tests.
// const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../../helpers/proxy')

let unlock //, lock

contract('Lock / erc721 / tokenURI', accounts => {
  before(async () => {
    unlock = await getUnlockProxy(unlockContract)

    // const locks = await deployLocks(unlock, accounts[0])
    // lock = locks['FIRST']
  })

  describe('the global tokenURI stored in Unlock', () => {
    let txObj, event

    it('should return the global base token URI', async () => {
      assert.equal(await unlock.getGlobalBaseTokenURI.call(), '')
    })

    it('should allow the owner to set the global token URI', async () => {
      txObj = await unlock.setGlobalBaseTokenURI(
        'https://newTokenURI.com/api/key',
        {
          from: accounts[0],
        }
      )
      event = txObj.logs[0]
      assert.equal(
        await unlock.getGlobalBaseTokenURI.call(),
        'https://newTokenURI.com/api/key'
      )
    })

    it('should fail if someone other than the owner tries to set the URI', async () => {
      await shouldFail(
        unlock.setGlobalBaseTokenURI('https://fakeURI.com', {
          from: accounts[1],
        })
      )
    })

    it('should emit the NewTokenURI event', async () => {
      assert.equal(event.event, 'NewTokenURI')
    })
  })
})
