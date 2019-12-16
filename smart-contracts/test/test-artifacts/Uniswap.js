const helpers = require('hardlydifficult-ethereum-contracts')

contract('test-artifacts / uniswap', accounts => {
  const protocolOwner = accounts[0]
  let uniswap
  let sai

  before(async () => {
    uniswap = await helpers.protocols.uniswap.deploy(web3, protocolOwner)
    sai = await helpers.tokens.sai.deploy(web3, protocolOwner)
  })

  it('Can create an exchange and add liquidity', async () => {
    const tx = await uniswap.createExchange(sai.address, {
      from: protocolOwner,
    })
    const exchange = await helpers.protocols.uniswap.getExchange(
      web3,
      tx.logs[0].args.exchange
    )
    await sai.mint(protocolOwner, '10000000000', { from: protocolOwner })
    await sai.approve(exchange.address, -1, { from: protocolOwner })
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
