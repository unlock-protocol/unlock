const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../../helpers/proxy')

let unlock, lock

contract('Lock / erc721 / name', accounts => {
  before(async () => {
    unlock = await getUnlockProxy(unlockContract)
    const locks = await deployLocks(unlock, accounts[0])
    lock = locks['FIRST']
  })

  describe('when there is no name', () => {
    it('should return nothing when attempting to read the name', async () => {
      assert.equal(await lock.name.call(), '')
    })

    it('should fail if someone other than the owner tries to set the name', async () => {
      await shouldFail(
        lock.updateLockName('Hardly', {
          from: accounts[1],
        })
      )
    })

    it('should allow the owner to set a name', async () => {
      await lock.updateLockName('Hardly', {
        from: accounts[0],
      })
    })
  })

  describe('when the Lock has a name', () => {
    before(async () => {
      await lock.updateLockName('Hardly', {
        from: accounts[0],
      })
    })

    it('should return return the expected name', async () => {
      assert.equal(await lock.name.call(), 'Hardly')
    })

    it('should fail if someone other than the owner tries to change the name', async () => {
      await shouldFail(
        lock.updateLockName('Difficult', {
          from: accounts[1],
        })
      )
    })

    describe('should allow the owner to set a name', () => {
      before(async () => {
        await lock.updateLockName('Difficult', {
          from: accounts[0],
        })
      })

      it('should return return the expected name', async () => {
        assert.equal(await lock.name.call(), 'Difficult')
      })
    })

    describe('should allow the owner to unset the name', () => {
      before(async () => {
        await lock.updateLockName('', {
          from: accounts[0],
        })
      })

      it('should return return the expected name', async () => {
        assert.equal(await lock.name.call(), '')
      })
    })
  })
})
