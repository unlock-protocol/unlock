const helpers = require('hardlydifficult-ethereum-contracts')

contract('test-artifacts / dai', accounts => {
  const protocolOwner = accounts[0]
  let dai

  before(async () => {
    dai = await helpers.tokens.dai.deploy(web3, protocolOwner)
  })

  it('the owner can mint tokens', async () => {
    await dai.mint(protocolOwner, '10000000000', {
      from: protocolOwner,
    })
    assert.equal(await dai.balanceOf(protocolOwner), 10000000000)
  })
})
