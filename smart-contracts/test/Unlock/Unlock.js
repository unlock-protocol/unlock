const Unlock = artifacts.require('./Unlock.sol')
const shared = require('./behaviors/shared')

contract('Unlock', (accounts) => {
  describe('Standard Unlock contract', function () {
    before(async function () {
      this.unlock = await Unlock.deployed()
    })

    shared.shouldBehaveLikeV1(accounts, accounts[0])
  })
})
