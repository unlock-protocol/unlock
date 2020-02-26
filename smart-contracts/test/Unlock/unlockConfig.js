const { reverts } = require('truffle-assertions')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock
let unlockOwner

contract('Lock / configUnlock', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    unlockOwner = accounts[0]
  })

  describe('configuring the Unlock contract', () => {
    it('should let the owner configure the Unlock contract', async () => {
      await unlock.configUnlock('', '', {
        from: unlockOwner,
      })
    })

    it('should revert if called by other than the owner', async () => {
      await reverts(
        unlock.configUnlock('', '', {
          from: accounts[7],
        }),
        'Ownable: caller is not the owner'
      )
    })
  })
})
