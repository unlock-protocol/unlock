const { ADDRESS_ZERO } = require('../helpers/constants')

module.exports.getBalanceBehavior = (options) => {
  describe('Lock / behaviors / directTips', () => {
    let lock

    beforeEach(async () => {
      ;({ lock } = options)
      await web3.eth.sendTransaction({ to: lock, value: 42 })
    })

    it('ETH tip balance appears', async () => {
      const balance = await web3.eth.balanceOf(lock)
      assert.equal(balance.toString(), 42)
    })

    it('can withdraw ETH', async () => {
      await lock.withdraw(ADDRESS_ZERO)
      const balance = await web3.eth.balanceOf(lock)
      assert.equal(balance.toString(), 0)
    })
  })
}
