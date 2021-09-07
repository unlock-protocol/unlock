const BigNumber = require('bignumber.js')
const { constants, protocols, tokens } = require('hardlydifficult-eth')

const SwapAndCall = artifacts.require('SwapAndCall.sol')
const { reverts, fails } = require('truffle-assertions')
const makeCalls = require('./helpers/makeCalls')

async function createAndFundExchange(uniswap, token, tokenOwner) {
  let tx = await uniswap.createExchange(token.address, {
    from: tokenOwner,
  })
  const exchange = await protocols.uniswapV1.getExchange(
    web3,
    tx.logs[0].args.exchange
  )
  await token.mint(tokenOwner, '1000000000000000000000000', {
    from: tokenOwner,
  })
  
  await token.approve(exchange.address, constants.MAX_UINT, { from: tokenOwner })
  
  const blockNumber = await web3.eth.getBlockNumber()
  const latestBlock = await web3.eth.getBlock(blockNumber)

  await exchange.addLiquidity(
    '1',
    '1000000000000000000000000',
    latestBlock.timestamp + 60,
    {
      from: tokenOwner,
      value: web3.utils.toWei('1', 'ether'),
    }
  )

  return exchange
}

contract('swapAndCall', accounts => {
  const owner = accounts[0]
  const testAccount = accounts[2]
  const keyPrice = web3.utils.toWei('0.00042', 'ether')
  let targetToken
  let sourceToken
  let targetExchange
  let sourceExchange
  let tokenLock
  let ethLock
  let swapAndCall

  beforeEach(async () => {
    // Token
    targetToken = await tokens.sai.deploy(web3, owner)
    sourceToken = await tokens.sai.deploy(web3, owner)

    // Uniswap exchange with liquidity for testing
    const uniswap = await protocols.uniswapV1.deploy(web3, owner)
    targetExchange = await createAndFundExchange(uniswap, targetToken, owner)
    sourceExchange = await createAndFundExchange(uniswap, sourceToken, owner)

    ethLock = await protocols.unlock.createTestLock(web3, {
      keyPrice,
      from: accounts[1], // Lock owner
    })
    // Lock priced in ERC-20 tokens
    tokenLock = await protocols.unlock.createTestLock(web3, {
      tokenAddress: targetToken.address,
      keyPrice,
      from: accounts[1], // Lock owner
    })

    swapAndCall = await SwapAndCall.new()
  })

  it("Sanity check: Can't purchase keys with ether", async () => {
    await fails(
      tokenLock.purchase(keyPrice, testAccount, constants.ZERO_ADDRESS, [], {
        from: testAccount,
        value: await targetExchange.getEthToTokenOutputPrice(keyPrice),
      })
    )
  })

  it('Sanity check: Can purchase keys with tokens', async () => {
    await targetToken.mint(testAccount, '1000000000000000000000000', {
      from: owner,
    })
    await targetToken.approve(tokenLock.address, constants.MAX_UINT, { from: testAccount })
    tokenLock.purchase(keyPrice, testAccount, constants.ZERO_ADDRESS, [], {
      from: testAccount,
    })
  })

  describe('Purchase key priced in tokens with ether', () => {
    beforeEach(async () => {
      const ethValue = new BigNumber(
        await targetExchange.getEthToTokenOutputPrice(keyPrice)
      )
        .times(1.1)
        .dp(0, BigNumber.ROUND_UP)
      const calls = []
      // Swap ETH provided into the target token
      calls.push({
        contract: targetExchange.address,
        callData: targetExchange.contract.methods
          .ethToTokenSwapOutput(keyPrice, constants.MAX_UINT)
          .encodeABI(),
        value: ethValue,
      })
      // Approve the Lock to spend funds help by the swapAndCall contract
      calls.push({
        contract: targetToken.address,
        callData: targetToken.contract.methods
          .approve(tokenLock.address, keyPrice) // using the exact amount when possible saves gas
          .encodeABI(),
      })
      // Call purchase on the Lock
      calls.push({
        contract: tokenLock.address,
        callData: tokenLock.contract.methods
          .purchase(keyPrice, testAccount, constants.ZERO_ADDRESS, [])
          .encodeABI(),
      })
      // Tokens to refund in case keyPrice went down
      // (n/a with v5 but may be again with v6)
      await makeCalls(swapAndCall, undefined, 0, calls, targetToken.address, {
        from: testAccount,
        value: ethValue.toFixed(),
      })
    })

    it('Has a valid key', async () => {
      const hasKey = await tokenLock.getHasValidKey(testAccount)
      assert.equal(hasKey, true)
    })

    it('Has no ether left behind', async () => {
      const balance = await web3.eth.getBalance(swapAndCall.address)
      assert.equal(balance, 0)
    })

    it('Has no tokens left behind', async () => {
      const balance = await targetToken.balanceOf(swapAndCall.address)
      assert.equal(balance, 0)
    })
  })


  describe('started with sourceTokens', () => {
    beforeEach(async () => {
      await sourceToken.mint(testAccount, '1000000000000000000000000', {
        from: owner,
      })
      // Infinite approval for the tokenSpender allows us to call this once for many swapAndCalls
      await sourceToken.approve(await swapAndCall.tokenSpender(), constants.MAX_UINT, {
        from: testAccount,
      })
    })

    describe('Purchase key priced in tokens with a different token', () => {
      beforeEach(async () => {
        const calls = []
        const sourceValue = new BigNumber(
          await sourceExchange.getTokenToEthOutputPrice(
            await targetExchange.getEthToTokenOutputPrice(keyPrice)
          )
        )
          .times(1.1)
          .dp(0, BigNumber.ROUND_UP)

        // Approve the exchange to take source tokens from the swapAndCall contract
        calls.push({
          contract: sourceToken.address,
          callData: sourceToken.contract.methods
            .approve(sourceExchange.address, sourceValue.toFixed()) // Exact approval saves gas
            .encodeABI(),
        })
        // Swap tokens provided into the target token
        calls.push({
          contract: sourceExchange.address,
          callData: sourceExchange.contract.methods
            .tokenToTokenSwapOutput(keyPrice, constants.MAX_UINT, constants.MAX_UINT, constants.MAX_UINT, targetToken.address)
            .encodeABI(),
        })
        // Approve the Lock to spend funds help by the swapAndCall contract
        calls.push({
          contract: targetToken.address,
          callData: targetToken.contract.methods
            .approve(tokenLock.address, keyPrice) // Exact approval saves gas
            .encodeABI(),
        })
        // Call purchase on the Lock
        calls.push({
          contract: tokenLock.address,
          callData: tokenLock.contract.methods
            .purchase(keyPrice, testAccount, constants.ZERO_ADDRESS, [])
            .encodeABI(),
        })
        // Tokens to refund in case keyPrice went down
        // (n/a with v5 but may be again with v6)
        await makeCalls(
          swapAndCall,
          sourceToken.address,
          sourceValue,
          calls,
          targetToken.address,
          {
            from: testAccount,
          }
        )
      })

      it('Has a valid key', async () => {
        const hasKey = await tokenLock.getHasValidKey(testAccount)
        assert.equal(hasKey, true)
      })

      it('Has no ether left behind', async () => {
        const balance = await web3.eth.getBalance(swapAndCall.address)
        assert.equal(balance, 0)
      })

      it('Has no source tokens left behind', async () => {
        const balance = await sourceToken.balanceOf(swapAndCall.address)
        assert.equal(balance, 0)
      })

      it('Has no target tokens left behind', async () => {
        const balance = await targetToken.balanceOf(swapAndCall.address)
        assert.equal(balance, 0)
      })
    })

    describe('Purchase key priced in eth with a token', () => {
      beforeEach(async () => {
        const calls = []
        const sourceValue = new BigNumber(
          await sourceExchange.getTokenToEthOutputPrice(keyPrice)
        )
          .times(1.1)
          .dp(0, BigNumber.ROUND_UP)
        // Approve the exchange to take source tokens from the swapAndCall contract
        calls.push({
          contract: sourceToken.address,
          callData: sourceToken.contract.methods
            .approve(sourceExchange.address, sourceValue.toFixed()) // Exact approval saves gas
            .encodeABI(),
        })
        // Swap tokens provided into the target token
        calls.push({
          contract: sourceExchange.address,
          callData: sourceExchange.contract.methods
            .tokenToEthSwapOutput(keyPrice, constants.MAX_UINT, constants.MAX_UINT)
            .encodeABI(),
        })
        // Call purchase on the Lock
        calls.push({
          contract: ethLock.address,
          callData: ethLock.contract.methods
            .purchase(keyPrice, testAccount, constants.ZERO_ADDRESS, [])
            .encodeABI(),
          value: keyPrice,
        })
        await makeCalls(
          swapAndCall,
          sourceToken.address,
          sourceValue,
          calls,
          undefined,
          {
            from: testAccount,
          }
        )
      })

      it('Has a valid key', async () => {
        const hasKey = await ethLock.getHasValidKey(testAccount)
        assert.equal(hasKey, true)
      })

      it('Has no ether left behind', async () => {
        const balance = await web3.eth.getBalance(swapAndCall.address)
        assert.equal(balance, 0)
      })

      it('Has no source tokens left behind', async () => {
        const balance = await sourceToken.balanceOf(swapAndCall.address)
        assert.equal(balance, 0)
      })
    })

    describe('Purchase fails when paused', () => {
      beforeEach(async () => {
        await swapAndCall.pause()
      })

      it('should fail', async () => {
        const calls = []
        const sourceValue = new BigNumber(
          await sourceExchange.getTokenToEthOutputPrice(keyPrice)
        )
          .times(1.1)
          .dp(0, BigNumber.ROUND_UP)
        // Approve the exchange to take source tokens from the swapAndCall contract
        calls.push({
          contract: sourceToken.address,
          callData: sourceToken.contract.methods
            .approve(sourceExchange.address, sourceValue.toFixed())
            .encodeABI(),
        })
        // Swap tokens provided into the target token
        calls.push({
          contract: sourceExchange.address,
          callData: sourceExchange.contract.methods
            .tokenToEthSwapOutput(keyPrice, constants.MAX_UINT, constants.MAX_UINT)
            .encodeABI(),
        })
        // Call purchase on the Lock
        calls.push({
          contract: ethLock.address,
          callData: ethLock.contract.methods
            .purchase(keyPrice, testAccount, constants.ZERO_ADDRESS, [])
            .encodeABI(),
          value: keyPrice,
        })
        await reverts(
          makeCalls(
            swapAndCall,
            sourceToken.address,
            sourceValue,
            calls,
            undefined,
            {
              from: testAccount,
            }
          ),
          'Pausable: paused'
        )
      })
    })
  })
})
