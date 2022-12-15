const { ethers, unlock, upgrades } = require('hardhat')
const { impersonate, DAI, WETH, ADDRESS_ZERO, UNISWAP_ROUTER_ADDRESS, deployLock, purchaseKey } = require('../helpers')
const { expect } = require('chai')

// get unlock address in mainnet
const { networks : { 1 : { unlockAddress }} } = unlock

const UNLOCK_PROXY_OWNER = '0xF867712b963F00BF30D372b857Ae7524305A0CE7'
const ADDRESS_WITH_DAI = '0x075e72a5eDf65F0A5f44699c7654C1a76941Ddc8'

const value = ethers.utils.parseEther('.1')
const poolFee = 3000

describe(`swapAndCall`, function() {

  let unlock, lock, keyOwner, keyPrice, dai, daiOwner

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
      let calldata, receipt, balanceBefore, lockBalanceBefore

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
        balanceBefore = await ethers.provider.getBalance(keyOwner.address)
        lockBalanceBefore = await dai.balanceOf(lock.address)        

        // do the swap
        const tx = await unlock.connect(keyOwner)
          .swapAndCall(
            lock.address,
            ADDRESS_ZERO,
            value, // amountInMax (in ETH)
            keyPrice, // amountOut (in DAI)
            poolFee,
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
        const { args } = events.find(({event}) => event === 'SwapCallRefund')
        expect(args.tokenAddress).to.equal(ADDRESS_ZERO)
        // test for value for xdai key price roughly
        expect(args.value.gte(ethers.utils.parseEther('.09'))).to.equal(true)
      })

      it('send back the excess tokens', async () => {
        const { events, cumulativeGasUsed, effectiveGasPrice } = receipt
        const { args } = events.find(({event}) => event === 'SwapCallRefund')
        
        const balanceAfter = await ethers.provider.getBalance(keyOwner.address)
        const totalSpent = balanceBefore.sub(balanceAfter)
        
        const txFee = cumulativeGasUsed.mul(effectiveGasPrice)        
        const keyPriceETH = value.sub(args.value).toString()
        expect(totalSpent.toString()).to.equal(txFee.add(keyPriceETH).toString())
      })
    })

    describe('extend', async () => {
      let tokenId, receipt, balanceBefore, lockBalanceBefore
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
        balanceBefore = await ethers.provider.getBalance(keyOwner.address)
        lockBalanceBefore = await dai.balanceOf(lock.address)        

        // do the swap and call
        const tx = await unlock.connect(keyOwner)
          .swapAndCall(
            lock.address,
            ADDRESS_ZERO,
            value, // amountInMax (in ETH)
            keyPrice, // amountOut (in DAI)
            poolFee,
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
        const { args } = events.find(({event}) => event === 'SwapCallRefund')
        expect(args.tokenAddress).to.equal(ADDRESS_ZERO)
        // test for value for xdai key price roughly
        expect(args.value.gte(ethers.utils.parseEther('.09'))).to.equal(true)
      })

      it('send back the excess tokens', async () => {
        const { events, cumulativeGasUsed, effectiveGasPrice } = receipt
        const { args } = events.find(({event}) => event === 'SwapCallRefund')
        
        const balanceAfter = await ethers.provider.getBalance(keyOwner.address)
        const totalSpent = balanceBefore.sub(balanceAfter)
        
        const txFee = cumulativeGasUsed.mul(effectiveGasPrice)        
        const keyPriceETH = value.sub(args.value).toString()
        expect(totalSpent.toNumber()).to.equal(txFee.add(keyPriceETH).toNumber())
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
      let calldata, receipt, balanceBefore, lockBalanceBefore

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
        balanceBefore = await dai.balanceOf(keyOwner.address)        

        // do the swap
        await dai.connect(keyOwner).approve(unlock.address, maxDAIAmount)
        const tx = await unlock.connect(keyOwner)
          .swapAndCall(
            lock.address,
            DAI,
            maxDAIAmount, // amountInMax (in DAI)
            keyPrice, // amountOut (in ETH)
            poolFee,
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
        const { args } = events.find(({event}) => event === 'SwapCallRefund')
        expect(args.tokenAddress).to.equal(DAI)
        // test for value for xdai key price roughly
        expect(args.value.gte(ethers.utils.parseEther('.09'))).to.equal(true)
      })

      it('send back the excess tokens', async () => {
        const { events } = receipt
        const { args } = events.find(({event}) => event === 'SwapCallRefund')
        
        const balanceAfter = await dai.balanceOf(keyOwner.address)
        const totalSpent = balanceBefore.sub(balanceAfter)
        
        const keyPriceDAI = maxDAIAmount.sub(args.value).toString()
        expect(totalSpent.eq(keyPriceDAI)).to.equal(true)
      })

      it('should revert if the amount of tokens is unsufficient')
    })

    describe('extend', async () => {
      let tokenId, receipt, balanceBefore, lockBalanceBefore
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
        balanceBefore = await dai.balanceOf(keyOwner.address)
        lockBalanceBefore = await ethers.provider.getBalance(lock.address)
        assert((await dai.balanceOf(keyOwner.address)).gt(maxDAIAmount))
        
        // do the swap and call
        await dai.connect(keyOwner).approve(unlock.address, maxDAIAmount)
        const tx = await unlock.connect(keyOwner)
          .swapAndCall(
            lock.address,
            DAI,
            maxDAIAmount, // amountInMax (in DAI)
            keyPrice, // amountOut (in ETH)
            poolFee,
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
        const { args } = events.find(({event}) => event === 'SwapCallRefund')
        expect(args.tokenAddress).to.equal(DAI)
        // test for value for xdai key price roughly
        expect(args.value.gte(ethers.utils.parseEther('.09'))).to.equal(true)
      })

      it('send back the excess tokens', async () => {
        const { events } = receipt
        const { args } = events.find(({event}) => event === 'SwapCallRefund')
        
        const balanceAfter = await dai.balanceOf(keyOwner.address)
        const totalSpent = balanceBefore.sub(balanceAfter)
        
        const keyPriceDAI = maxDAIAmount.sub(args.value).toString()
        expect(totalSpent.eq(keyPriceDAI)).to.equal(true)
      })
    })
  })

})
