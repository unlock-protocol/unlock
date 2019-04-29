// const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../../helpers/proxy')

let unlock //lock

contract('Lock / erc721 / name', accounts => {
  before(async () => {
    unlock = await getUnlockProxy(unlockContract)
    // const locks = await deployLocks(unlock, accounts[0])
    // lock = locks['FIRST']
  })

  describe('the global tokenURI stored in Unlock', () => {
    it('should return the global base token URI', async () => {
      assert.equal(
        await unlock.getGlobalBaseTokenURI.call(),
        'https://locksmith.unlock-protocol.com/api/key/'
      )
    })

    it('should allow the owner to set the global token URI', async () => {
      await unlock.setGlobalBaseTokenURI('https://newTokenURI.com/api/key', {
        from: accounts[0],
      })
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
  })
})
