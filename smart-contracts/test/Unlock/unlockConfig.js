const shouldFail = require('../helpers/shouldFail')

const unlockContract = artifacts.require('Unlock.sol')
const PublicLock = artifacts.require('PublicLock')
const getProxy = require('../helpers/proxy')

let unlock, lockTemplate, unlockOwner

contract('Lock / configUnlock', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    lockTemplate = await PublicLock.new()
    unlockOwner = accounts[0]
  })

  describe('configuring the Unlock contract', () => {
    it('should let the owner configure the Unlock contract', async () => {
      await unlock.configUnlock(lockTemplate.address, '', '', {
        from: unlockOwner,
      })
    })

    it('should revert if called by other than the owner', async () => {
      await shouldFail(
        unlock.configUnlock(lockTemplate.address, '', '', {
          from: accounts[7],
        }),
        'Ownable: caller is not the owner'
      )
    })

    it('should revert if the lock template address is not a contract', async () => {
      await shouldFail(
        unlock.configUnlock(accounts[7], '', '', {
          from: unlockOwner,
        }),
        'NOT_A_CONTRACT'
      )
    })
  })
})
