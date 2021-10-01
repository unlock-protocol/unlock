const { ethers } = require('hardhat')

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
      const balance = lock.isErc20 ?
        await Erc20Token.at(await lock.tokenAddress()).balanceOf(lock.address)
        :
        await web3.eth.getBalance(lock.address)
      assert.equal(balance.toString(), keyPrice.toString())
    })

    it('get balance of account', async () => {
      const balance = lock.isErc20 ?
        await Erc20Token.at(await lock.tokenAddress()).balanceOf(accounts[1])
        :
        await web3.eth.getBalance(accounts[1])
      assert(ethers.BigNumber.from(balance).gt(0))
    })
  })
}
