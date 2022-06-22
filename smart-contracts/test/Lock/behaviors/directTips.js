const { ethers } = require('hardhat')
const { ADDRESS_ZERO } = require('../../helpers/constants')
const { getBalance } = require('../../helpers')

module.exports.getBalanceBehavior = (options) => {
  describe('Lock / behaviors / directTips', () => {
    let lock

    beforeEach(async () => {
      ;({ lock } = options)
      await ethers.provider.sendTransaction({ to: lock, value: 42 })
    })

    it('ETH tip balance appears', async () => {
      const balance = await getBalance(lock)
      assert.equal(balance.toString(), 42)
    })

    it('can withdraw ETH', async () => {
      await lock.withdraw(ADDRESS_ZERO)
      const balance = await getBalance(lock)
      assert.equal(balance.toString(), 0)
    })
  })
}
