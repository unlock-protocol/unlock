const helpers = require('hardlydifficult-test-helpers')

contract('test-artifacts / uniswap', accounts => {
  const protocolOwner = accounts[0]
  let uniswap
  let dai

  before(async () => {
    uniswap = await helpers.protocols.uniswap.deploy(web3, protocolOwner)
    dai = await helpers.tokens.dai.deploy(web3, protocolOwner)
  })

  it('Can create an exchange and add liquidity', async () => {
    const tx = await uniswap.createExchange(dai.address, {
      from: protocolOwner,
    })
    const exchange = await helpers.protocols.uniswap.getExchange(
      web3,
      tx.logs[0].args.exchange
    )
    await dai.mint(protocolOwner, '10000000000', { from: protocolOwner })
    await dai.approve(exchange.address, -1, { from: protocolOwner })
    await exchange.addLiquidity(
      '1',
      '10000000000',
      Math.round(Date.now() / 1000) + 60,
      {
        from: protocolOwner,
        value: '10000000000',
      }
    )

    // Can get the value of tokens
    const value = await exchange.getEthToTokenOutputPrice(100000)
    assert.notEqual(value, 0)
  })
})
