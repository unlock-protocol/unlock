const BigNumber = require('bignumber.js')

const { protocols } = require('hardlydifficult-test-helpers')
const deployLocks = require('../helpers/deployLocks')

const TestErc20Token = artifacts.require('TestErc20Token.sol')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock, locks, lock, token, exchange

contract('Unlock / uniswapValue', accounts => {
  const price = '10000000000000000'
  const ethValue = '9969999900' // an arbitrary goal based on the liquidity provided for this test

  beforeEach(async () => {
    unlock = await getProxy(unlockContract)
  })

  describe('A supported token', () => {
    beforeEach(async () => {
      token = await TestErc20Token.new()
      // Mint some tokens so that the totalSupply is greater than 0
      await token.mint(accounts[0], '1000000000000000000000000')

      locks = await deployLocks(unlock, accounts[0], token.address)
      lock = locks['FIRST']

      // Deploy the exchange
      const uniswapFactory = await protocols.uniswap.deploy(web3, accounts[0])
      const tx = await uniswapFactory.createExchange(token.address, {
        from: accounts[0],
      })
      exchange = await protocols.uniswap.getExchange(
        web3,
        tx.logs[0].args.exchange
      )

      // Approve transfering tokens to the exchange
      await token.approve(exchange.address, -1, { from: accounts[0] })

      // And seed it
      await exchange.addLiquidity(
        '1',
        '1000000000000000000000000',
        Math.round(Date.now() / 1000) + 60,
        {
          from: accounts[0],
          value: web3.utils.toWei('1', 'ether'),
        }
      )

      // Config in Unlock
      await unlock.setExchange(token.address, exchange.address)
    })

    it('Uniswap reports a non-zero value', async () => {
      const value = await exchange.getTokenToEthInputPrice(price)
      assert.equal(value.toString(), ethValue)
    })

    describe('Purchase key', () => {
      const keyOwner = accounts[1]
      let gdpBefore

      beforeEach(async () => {
        gdpBefore = new BigNumber(await unlock.grossNetworkProduct())

        await token.mint(keyOwner, price, { from: accounts[0] })
        await token.approve(lock.address, -1, { from: keyOwner })

        await lock.purchase(keyOwner, web3.utils.padLeft(0, 40), [], {
          from: keyOwner,
        })
      })

      it('GDP went up by the expected ETH value', async () => {
        const gdp = new BigNumber(await unlock.grossNetworkProduct())
        assert.equal(gdp.toFixed(), gdpBefore.plus(ethValue).toFixed())
      })
    })
  })

  describe('A unsupported token', () => {
    beforeEach(async () => {
      token = await TestErc20Token.new()
      // Mint some tokens so that the totalSupply is greater than 0
      await token.mint(accounts[0], '1000000000000000000000000')

      locks = await deployLocks(unlock, accounts[0], token.address)
      lock = locks['FIRST']
    })

    describe('Purchase key', () => {
      const keyOwner = accounts[1]
      let gdpBefore

      beforeEach(async () => {
        gdpBefore = new BigNumber(await unlock.grossNetworkProduct())

        await token.mint(keyOwner, price, { from: accounts[0] })
        await token.approve(lock.address, -1, { from: keyOwner })

        await lock.purchase(keyOwner, web3.utils.padLeft(0, 40), [], {
          from: keyOwner,
        })
      })

      it('GDP did not change', async () => {
        const gdp = new BigNumber(await unlock.grossNetworkProduct())
        assert.equal(gdp.toFixed(), gdpBefore.toFixed())
      })
    })
  })

  describe('ETH', () => {
    beforeEach(async () => {
      locks = await deployLocks(unlock, accounts[0])
      lock = locks['FIRST']
    })

    describe('Purchase key', () => {
      const keyOwner = accounts[1]
      let gdpBefore

      beforeEach(async () => {
        gdpBefore = new BigNumber(await unlock.grossNetworkProduct())

        await lock.purchase(keyOwner, web3.utils.padLeft(0, 40), [], {
          from: keyOwner,
          value: price,
        })
      })

      it('GDP went up by the keyPrice', async () => {
        const gdp = new BigNumber(await unlock.grossNetworkProduct())
        assert.equal(gdp.toFixed(), gdpBefore.plus(price).toFixed())
      })
    })
  })
})
