const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock

contract('Unlock / version', () => {
  before(async () => {
    unlock = await getProxy(unlockContract)
  })

  it('getVersion', async () => {
    assert.equal((await unlock.unlockVersion.call()).toString(), '5')
  })
})
