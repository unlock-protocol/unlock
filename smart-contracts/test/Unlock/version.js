const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../helpers/proxy')

let unlock

contract('Unlock / version', () => {
  before(async () => {
    unlock = await getUnlockProxy(unlockContract)
  })

  it('getVersion', async () => {
    assert.equal((await unlock.unlockVersion.call()).toString(), '4')
  })
})
