const { ethers, unlock, upgrades } = require('hardhat')
const { impersonate, DAI, WETH, ADDRESS_ZERO, UNISWAP_ROUTER_ADDRESS, deployLock, purchaseKey, USDC } = require('../helpers')
const { encodeRouteToPath } = require('@uniswap/v3-sdk')

const { expect } = require('chai')

// uniswap router
const { AlphaRouter } = require('@uniswap/smart-order-router')
const { Token, CurrencyAmount, TradeType } = require('@uniswap/sdk-core')
const JSBI  = require('jsbi')

// get unlock address in mainnet
const { networks : { 1 : { unlockAddress }} } = unlock

const UNLOCK_PROXY_OWNER = '0xF867712b963F00BF30D372b857Ae7524305A0CE7'
const ADDRESS_WITH_DAI = '0x075e72a5eDf65F0A5f44699c7654C1a76941Ddc8'
const ADDRESS_WITH_USDC = '0xf977814e90da44bfa03b6295a0616a897441acec' // binance

const value = ethers.utils.parseEther('.1')

const getUniswapRouterPath = async (token0, token1, amountOut) => {
  const tokenIn = new Token(
    1,
    token0,
    token0 === USDC ? 6 : 18,
  )
  const tokenOut = new Token(
    1,
    token1,
    token1 === USDC ? 6 : 18,
  )

  const outputAmount = CurrencyAmount.fromRawAmount(tokenOut, JSBI.BigInt(amountOut))
  
  // uniswap smart router
  const router = new AlphaRouter({ chainId: 1, provider: ethers.provider })
  const route = await router.route(
    outputAmount,
    tokenIn, // quoteCurrency
    TradeType.EXACT_OUTPUT, // swapType
  )

  const bestRoute = route.route[0].route
  const path = encodeRouteToPath(bestRoute, TradeType.EXACT_OUTPUT)
  
  // console.log(`Quote Exact In: ${route.quote.toFixed(2)}`);
  // console.log(`Gas Adjusted Quote In: ${route.quoteGasAdjusted.toFixed(2)}`);
  // console.log(`Gas Used USD: ${route.estimatedGasUsedUSD.toFixed(6)}`);

  return path
}

describe(`swapAndCall`, function() {

  let unlock, lock, keyOwner, keyPrice, dai, daiOwner, usdc, usdcOwner, uniswapRouterPath

  before(async function() {
    if (!process.env.RUN_MAINNET_FORK) {
      // all suite will be skipped
      this.skip()
    }

    [, keyOwner] = await ethers.getSigners()
    
    // ERC20
    dai = await ethers.getContractAt('TestERC20', DAI)
    await impersonate(ADDRESS_WITH_DAI)
    daiOwner = await ethers.getSigner(ADDRESS_WITH_DAI)
    
    usdc = await ethers.getContractAt('TestERC20', USDC)
    await impersonate(ADDRESS_WITH_USDC)
    usdcOwner = await ethers.getSigner(ADDRESS_WITH_USDC)
    
    // get contract
    unlock = await ethers.getContractAt('Unlock', unlockAddress)
    
    // upgrade Unlock with the modified version
    await impersonate(UNLOCK_PROXY_OWNER)
    const unlockProxyOwner = await ethers.getSigner(UNLOCK_PROXY_OWNER)
    const Unlock = await ethers.getContractFactory('Unlock', unlockProxyOwner)
    await upgrades.upgradeProxy(unlockAddress, Unlock)

    // get unlock owner
    const unlockOwnerAddress = await unlock.owner()
    await impersonate(unlockOwnerAddress)
    const unlockOwner = await ethers.getSigner(unlockOwnerAddress)
    
    // add uniswap address
    await unlock.connect(unlockOwner).configUnlock(
      ADDRESS_ZERO, // udt
      WETH,
      16000, // gasEstimate
      'KEY_SWAP',
      'http://locksmith:8080/api/key/',
      1, // mainnet fork
      UNISWAP_ROUTER_ADDRESS
    )
  })

  it('uniswap V3 router is set properly', async () => {
    expect(await unlock.uniswapRouter()).to.equal(UNISWAP_ROUTER_ADDRESS)
    expect(await unlock.weth()).to.equal(WETH)
  })
  
  it('dai is set properly', async () => {
    expect(await dai.decimals()).to.equal(18)
    expect(await dai.symbol()).to.equal('DAI')
  })

  describe('use ETH with a lock priced in DAI', () => {
    before(async () => {
      lock = await deployLock({ 
        unlock,
        tokenAddress: DAI,
        // make sure we can add multiple keys
        maxKeysPerAddress: 100,
        isEthers: true
      })
      keyPrice = await lock.keyPrice()
      uniswapRouterPath = await getUniswapRouterPath(DAI, WETH, keyPrice)
    })
    
    it('lock is set properly', async () => {  
      expect(await lock.tokenAddress()).to.equal(DAI)
      expect(
        (await lock.balanceOf(keyOwner.address)).toNumber()
      ).to.equal(0)
    })

    it('signer has enough ETH to buy a bunch of keys', async () => {
      expect(
        (await ethers.provider.getBalance(keyOwner.address)).gte(0)
      ).to.equal(true)
    })
    
    it('signer does not have any DAI', async () => {
      expect((await dai.balanceOf(keyOwner.address)).toNumber()).equal(0)
    })

    describe('purchase', () => {
      let calldata, receipt, lockBalanceBefore

      before  (async () => {
        const args = [
            [keyPrice], // keyPrices
            [keyOwner.address], // recipients
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]], // _data
        ]
          
        // parse call data
        calldata = await lock.interface.encodeFunctionData('purchase', args)
        lockBalanceBefore = await dai.balanceOf(lock.address)        

        // do the swap
        uniswapRouterPath = await getUniswapRouterPath(WETH, DAI, keyPrice)
        const tx = await unlock.connect(keyOwner)
          .swapAndCall(
            lock.address,
            ADDRESS_ZERO,
            value, // amountInMax (in ETH)
            uniswapRouterPath,
            calldata,
            { value }
          )
        receipt = await tx.wait()

      })

      it('purchase a key for the sender', async() => {
        expect(
          (await lock.balanceOf(keyOwner.address)).toNumber()
        ).to.equal(1)
      })
      
      it('lock has received the tokens', async () => {
        expect(
          (await dai.balanceOf(lock.address)).toString()
        ).to.equal(lockBalanceBefore.add(keyPrice).toString())
      })

      it('emit an event', async () => {
        const { events } = receipt
        const { args } = events.find(({event}) => event === 'SwapCall')
        expect(args.tokenAddress).to.equal(ADDRESS_ZERO)
        expect(args.lock).to.equal(lock.address)
        // test for value for xdai key price roughly
        expect(args.amountSpent.lte(ethers.utils.parseEther('.09'))).to.equal(true)
      })
    })

    describe('extend', async () => {
      let tokenId, receipt, lockBalanceBefore
      beforeEach(async () => {    
        // give our guy some dai
        await dai.connect(daiOwner).transfer(
          keyOwner.address, 
          ethers.utils.parseEther('1000')
        )

        // purchase the key in DAI
        const isErc20 = true
        assert((await dai.balanceOf(keyOwner.address)).gt(keyPrice))
        await dai.connect(keyOwner).approve(lock.address, keyPrice.mul(2))
        ;({tokenId} = await purchaseKey(lock, keyOwner.address, isErc20, keyPrice))

        // expire the key
        assert.equal(await lock.isValidKey(tokenId), true)
        await lock.expireAndRefundFor(tokenId, 0)
        assert.equal(await lock.isValidKey(tokenId), false)

        // parse extend calldata
        const extendArgs = [
          keyPrice,
          tokenId,
          ADDRESS_ZERO,
          [],
        ]
        const calldata = lock.interface.encodeFunctionData('extend', extendArgs)
        lockBalanceBefore = await dai.balanceOf(lock.address)
        uniswapRouterPath = await getUniswapRouterPath(WETH, DAI, keyPrice) 

        // do the swap and call
        const tx = await unlock.connect(keyOwner)
          .swapAndCall(
            lock.address,
            ADDRESS_ZERO,
            value, // amountInMax (in ETH)
            uniswapRouterPath,
            calldata,
            { value }
          )
        receipt = await tx.wait()
      })

      it('key is now valid', async () => {
        assert.equal(await lock.isValidKey(tokenId), true)
      })

      it('lock has received the tokens', async () => {
        expect(
          (await dai.balanceOf(lock.address)).toString()
        ).to.equal(lockBalanceBefore.add(keyPrice).toString())
      })

      it('emit an event', async () => {
        const { events } = receipt
        const { args } = events.find(({event}) => event === 'SwapCall')
        expect(args.tokenAddress).to.equal(ADDRESS_ZERO)
        // test for value for xdai key price roughly
        expect(args.amountSpent.lte(ethers.utils.parseEther('.09'))).to.equal(true)
      })

      
    })
  })

  describe('use DAI with a lock priced in ETH', () => {
    const maxDAIAmount = ethers.utils.parseEther('100')
    before(async () => {
      lock = await deployLock({ 
        unlock,
        tokenAddress: ADDRESS_ZERO,
        maxKeysPerAddress: 100,
        isEthers: true
      })

      keyPrice = await lock.keyPrice()

      // give our guy some dai
      await dai.connect(daiOwner).transfer(
        keyOwner.address, 
        maxDAIAmount.mul(4)
      )
    })
    
    it('lock is set properly', async () => {  
      expect(await lock.tokenAddress()).to.equal(ADDRESS_ZERO)
      expect(
        (await lock.balanceOf(keyOwner.address)).toNumber()
      ).to.equal(0)
    })

    it('signer has enough DAI to buy a bunch of keys', async () => {
      expect((await dai.balanceOf(keyOwner.address)).gte(maxDAIAmount)).to.equal(true)
    })
    
    describe('purchase', () => {
      let calldata, receipt, lockBalanceBefore

      before (async () => {
        const args = [
            [], // no keyPrice for ETH lock
            [keyOwner.address], // recipients
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]], // _data
        ]
          
        // parse call data
        calldata = await lock.interface.encodeFunctionData('purchase', args)
        lockBalanceBefore = await ethers.provider.getBalance(lock.address)
        
        // do the swap
        await dai.connect(keyOwner).approve(unlock.address, maxDAIAmount)
        uniswapRouterPath = await getUniswapRouterPath(DAI, WETH, keyPrice)
        const tx = await unlock.connect(keyOwner)
          .swapAndCall(
            lock.address,
            DAI,
            maxDAIAmount, // amountInMax (in DAI)
            uniswapRouterPath,
            calldata,
            { value : 0 }
          )
        receipt = await tx.wait()
      })

      it('purchase a key for the sender', async() => {
        expect(
          (await lock.balanceOf(keyOwner.address)).toNumber()
        ).to.equal(1)
      })
      
      it('lock has received the ETH', async () => {
        expect(
          (await ethers.provider.getBalance(lock.address)).toString()
        ).to.equal(lockBalanceBefore.add(keyPrice).toString())
      })

      it('emit an event', async () => {
        const { events } = receipt
        const { args } = events.find(({event}) => event === 'SwapCall')
        expect(args.tokenAddress).to.equal(DAI)
        // test for value for xdai key price roughly
        expect(args.amountSpent.lte(ethers.utils.parseEther('.09'))).to.equal(true)
      })
    })

    describe('extend', async () => {
      let tokenId, receipt, lockBalanceBefore
      beforeEach(async () => {    
        
        // purchase the key in ETH
        ;({tokenId} = await purchaseKey(lock, keyOwner.address))

        // expire the key
        assert.equal(await lock.isValidKey(tokenId), true)
        await lock.expireAndRefundFor(tokenId, 0)
        assert.equal(await lock.isValidKey(tokenId), false)

        // parse extend calldata
        const extendArgs = [
          0,
          tokenId,
          ADDRESS_ZERO,
          [],
        ]
        const calldata = lock.interface.encodeFunctionData('extend', extendArgs)
        lockBalanceBefore = await ethers.provider.getBalance(lock.address)
        assert((await dai.balanceOf(keyOwner.address)).gt(maxDAIAmount))
        
        // do the swap and call
        await dai.connect(keyOwner).approve(unlock.address, maxDAIAmount)
        uniswapRouterPath = await getUniswapRouterPath(DAI, WETH, keyPrice)
        const tx = await unlock.connect(keyOwner)
          .swapAndCall(
            lock.address,
            DAI,
            maxDAIAmount, // amountInMax (in DAI)
            uniswapRouterPath,
            calldata,
            { value: 0 }
          )
        receipt = await tx.wait()
      })

      it('key is now valid', async () => {
        assert.equal(await lock.isValidKey(tokenId), true)
      })

      it('lock has received the tokens', async () => {
        expect(
          (await ethers.provider.getBalance(lock.address)).toString()
        ).to.equal(lockBalanceBefore.add(keyPrice).toString())
      })

      it('emit an event', async () => {
        const { events } = receipt
        const { args } = events.find(({event}) => event === 'SwapCall')
        expect(args.tokenAddress).to.equal(DAI)
        // test for value for xdai key price roughly
        expect(args.amountSpent.lte(ethers.utils.parseEther('.09'))).to.equal(true)
      })
    })
  })

  describe('use DAI with a lock priced in USDC', async () => {
    const maxDAIAmount = ethers.utils.parseEther('1')
    before(async () => {
      lock = await deployLock({ 
        unlock,
        tokenAddress: USDC,
        maxKeysPerAddress: 100,
        keyPrice: ethers.utils.parseUnits('.5', 6), // USDC only 6 decimals
        isEthers: true
      })

      keyPrice = await lock.keyPrice()

      // give our guy some dai
      await dai.connect(daiOwner).transfer(
        keyOwner.address, 
        maxDAIAmount.mul(4)
      )
    })
    
    it('lock is set properly', async () => {  
      expect(await lock.tokenAddress()).to.equal(USDC)
      expect(
        (await lock.balanceOf(keyOwner.address)).toNumber()
      ).to.equal(0)
    })

    it('signer has enough DAI to buy a bunch of keys', async () => {
      expect((await dai.balanceOf(keyOwner.address)).gte(maxDAIAmount)).to.equal(true)
    })
    
    describe('purchase', () => {
      let calldata, receipt, lockBalanceBefore

      before (async () => {
        const args = [
            [keyPrice],
            [keyOwner.address], // recipients
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]], // _data
        ]
          
        // parse call data
        calldata = await lock.interface.encodeFunctionData('purchase', args)
        lockBalanceBefore = await usdc.balanceOf(lock.address)
        uniswapRouterPath = await getUniswapRouterPath(DAI, USDC, keyPrice)

        // do the swap
        await dai.connect(keyOwner).approve(unlock.address, maxDAIAmount)
        const tx = await unlock.connect(keyOwner)
          .swapAndCall(
            lock.address,
            DAI,
            maxDAIAmount, // amountInMax (in DAI)
            500, // uniswapRouterPath - no 3% DAI/USDC pool 
            calldata
          )
        receipt = await tx.wait()
      })

      it('purchase a key for the sender', async() => {
        expect(
          (await lock.balanceOf(keyOwner.address)).toNumber()
        ).to.equal(1)
      })
      
      it('lock has received the ETH', async () => {
        expect(
          (await usdc.balanceOf(lock.address)).toNumber()
        ).to.equal(lockBalanceBefore.add(keyPrice).toNumber())
      })

      it('emit an event', async () => {
        const { events } = receipt
        const { args } = events.find(({event}) => event === 'SwapCall')
        expect(args.tokenAddress).to.equal(DAI)
        // test for value for xdai key price roughly
        expect(args.amountSpent.lte(ethers.utils.parseEther('.4'))).to.equal(true)
      })
    })

    describe('extend', async () => {
      let tokenId, receipt, lockBalanceBefore
      beforeEach(async () => {    
        
        // purchase a key in USDC
        await usdc.connect(usdcOwner).transfer(keyOwner.address, keyPrice)
        await usdc.connect(keyOwner).approve(lock.address, keyPrice)
        ;({tokenId} = await purchaseKey(lock, keyOwner.address, true, keyPrice))
        
        // expire the key
        assert.equal(await lock.isValidKey(tokenId), true)
        await lock.expireAndRefundFor(tokenId, 0)
        assert.equal(await lock.isValidKey(tokenId), false)

        // parse extend calldata
        const extendArgs = [
          keyPrice,
          tokenId,
          ADDRESS_ZERO,
          [],
        ]
        const calldata = lock.interface.encodeFunctionData('extend', extendArgs)
        lockBalanceBefore = await usdc.balanceOf(lock.address)
        assert((await dai.balanceOf(keyOwner.address)).gt(maxDAIAmount))
        uniswapRouterPath = await getUniswapRouterPath(DAI, USDC, keyPrice)

        // do the swap and call
        await dai.connect(keyOwner).approve(unlock.address, maxDAIAmount)
        const tx = await unlock.connect(keyOwner)
          .swapAndCall(
            lock.address,
            DAI,
            maxDAIAmount, // amountInMax (in DAI)
            uniswapRouterPath,
            calldata,
            { value: 0 }
          )
        receipt = await tx.wait()
      })

      it('key is now valid', async () => {
        assert.equal(await lock.isValidKey(tokenId), true)
      })

      it('lock has received the tokens', async () => {
        expect(
          (await usdc.balanceOf(lock.address)).toString()
        ).to.equal(lockBalanceBefore.add(keyPrice).toString())
      })

      it('emit an event', async () => {
        const { events } = receipt
        const { args } = events.find(({event}) => event === 'SwapCall')
        expect(args.tokenAddress).to.equal(DAI)
        // test for value for xdai key price roughly
        expect(args.amountSpent.lte(ethers.utils.parseEther('.4'))).to.equal(true)
      })
    })
  })

  describe('errors', () => {
    it('pair does not exist (SHIBA/DAI)')
    it('the amount of tokens is not sufficient')
    it('the approval is unsufficient')
    it('pool fee is wrong')
  })

})
