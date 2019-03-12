const BigNumber = require('bignumber.js')
const TestErc20Token = artifacts.require('TestErc20Token.sol')

let token

contract('test-artifacts / TestErc20Token', (accounts) => {
  before(async () => {
    token = await TestErc20Token.new()
  })

  it('can mint tokens to use for testing', async () => {
    await token.mint(accounts[1], 42)
    const balance = new BigNumber(await token.balanceOf(accounts[1]))
    assert.equal(balance.toFixed(), 42)
  })

  it('can approve and transferFrom', async () => {
    await token.approve(accounts[0], -1, { from: accounts[1] })
    await token.transferFrom(accounts[1], accounts[2], 20, { from: accounts[0] })
    const balance1 = new BigNumber(await token.balanceOf(accounts[1]))
    assert.equal(balance1.toFixed(), 22)
    const balance2 = new BigNumber(await token.balanceOf(accounts[2]))
    assert.equal(balance2.toFixed(), 20)
  })
})
