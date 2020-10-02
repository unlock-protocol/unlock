module.exports.getBalanceBehavior = (options) => {
  describe('Lock / behaviors / getBalance', () => {
    let accounts
    let lock
    let keyPrice

    beforeEach(async () => {
      ;({ accounts, lock } = options)
      keyPrice = await lock.keyPrice()

      // Purchase 1 key
      await lock.purchase(
        keyPrice,
        accounts[2],
        web3.utils.padLeft(0, 40),
        [],
        {
          from: accounts[2],
          value: lock.isErc20 ? 0 : keyPrice,
        }
      )
    })

    it('get balance of contract', async () => {
      const balance = await lock.getBalance(
        await lock.tokenAddress(),
        lock.address
      )
      assert.equal(balance.toString(), keyPrice.toString())
    })

    it('get balance of account', async () => {
      const balance = await lock.getBalance(
        await lock.tokenAddress(),
        accounts[1]
      )
      assert(balance.gt(0))
    })
  })
}
