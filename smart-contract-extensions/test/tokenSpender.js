const { reverts } = require('truffle-assertions')
const { tokens } = require('hardlydifficult-eth')
const TokenSpender = artifacts.require('TokenSpender')
const constants = require('hardlydifficult-eth/src/constants')

contract('tokenSpender', accounts => {
  const [deployer, holder, other] = accounts
  let tokenSpender
  let token

  beforeEach(async () => {
    tokenSpender = await TokenSpender.new({ from: deployer })

    token = await tokens.dai.deploy(web3, deployer)
    await token.mint(holder, web3.utils.toWei('1', 'ether'), { from: deployer })
    await token.approve(tokenSpender.address, constants.MAX_UINT, { from: holder })
  })

  it('holder has a balance', async () => {
    const actual = await token.balanceOf(holder)
    assert.notEqual(actual.toString(), '0')
  })

  describe('claimTokens', async() => {
    beforeEach(async () => {
      await tokenSpender.claimTokens(token.address, holder, await token.balanceOf(holder), { from: deployer })
    })

    it('holder no longer has a balance', async () => {
      const actual = await token.balanceOf(holder)
      assert.equal(actual.toString(), '0')
    })
    
    it('deployer now has a balance', async () => {
      const actual = await token.balanceOf(deployer)
      assert.notEqual(actual.toString(), '0')
    })
  })

  it('should fail to claim from any other account', async () => {
    await reverts(
      tokenSpender.claimTokens(token.address, holder, await token.balanceOf(holder), { from: other }),
      'ACCESS_RESTRICTED'
    )
  })
})