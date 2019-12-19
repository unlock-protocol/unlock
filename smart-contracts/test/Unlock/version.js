const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../helpers/proxy')
const { LatestUnlockVersion } = require('../Unlock/upgrades/latestVersion.js')

let unlock

contract('Unlock / version', () => {
  before(async () => {
    unlock = await getProxy(unlockContract)
  })

  it('getVersion', async () => {
    assert.equal(
      (await unlock.unlockVersion.call()).toString(),
      LatestUnlockVersion
    )
  })
})
