const { run } = require('hardhat')
const { getUnlock } = require('@unlock-protocol/hardhat-helpers')

const assert = require('assert')

const unlockVersion = 13
const publicLockVersion = 14

describe('Deploy Tasks', () => {
  describe('deploy (main index)', () => {
    let unlock, unlockAddress, publicLockAddress
    before(async () => {
      ;({ unlockAddress, publicLockAddress } = await run('deploy', {
        unlockVersion: unlockVersion.toString(),
        publicLockVersion: publicLockVersion.toString(),
      }))
      unlock = await getUnlock(unlockAddress)
    })
    it('main contracts are deployed correctly', async () => {
      assert.equal(await unlock.getAddress(), unlockAddress)
      assert.equal(await unlock.publicLockAddress(), publicLockAddress)
    })
    it('versions are correct', async () => {
      assert.equal(await unlock.unlockVersion(), unlockVersion)
      assert.equal(await unlock.publicLockLatestVersion(), publicLockVersion)
    })
    it('unlock is configured correctly', async () => {
      assert.equal(await unlock.globalTokenSymbol(), 'KEY')
      assert.equal(
        await unlock.getGlobalBaseTokenURI(),
        'https://locksmith.unlock-protocol.com/api/key/31337/'
      )
      assert.equal(await unlock.chainId(), 31337)
    })
  })
})
