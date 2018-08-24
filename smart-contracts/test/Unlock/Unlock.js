const Unlock = artifacts.require('./Unlock.sol')
const shared = require('./behaviors/shared')

contract('Unlock', (accounts) => {
  const unlockOwner = accounts[2]
  describe('Standard Unlock contract', function () {
    beforeEach(async function () {
      this.unlock = await Unlock.new()
      await this.unlock.initialize(unlockOwner)
    })

    shared.shouldBehaveLikeV1(accounts, unlockOwner)
  })
})
