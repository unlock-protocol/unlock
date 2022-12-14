const { ethers, unlock, upgrades } = require('hardhat')
const { impersonate, DAI, WETH, ADDRESS_ZERO, UNISWAP_ROUTER_ADDRESS, deployLock } = require('../helpers')
const { expect } = require('chai')

// get unlock address in mainnet
const { networks : { 1 : { unlockAddress }} } = unlock

const UNLOCK_PROXY_OWNER = '0xF867712b963F00BF30D372b857Ae7524305A0CE7'
// const addressWithDAI = '0x075e72a5eDf65F0A5f44699c7654C1a76941Ddc8'

describe(`swapAndCall`, function() {

  let unlock, lock, keyOwner, keyPrice, dai

  before(async function() {
    if (!process.env.RUN_MAINNET_FORK) {
      // all suite will be skipped
      this.skip()
    }

    [, keyOwner] = await ethers.getSigners()

    // ERC20
    dai = await ethers.getContractAt('TestERC20', DAI)

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
        isEthers: true
      })

      keyPrice = await lock.keyPrice()

      // make sure we can add multiple keys
      // await lock.setMaxKeysPerAddress(5)
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
      const value = ethers.utils.parseEther('.1')
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
        const poolFee = 3000
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
        console.log({
          lockBalanceBefore: lockBalanceBefore.toString(),
          lockBalanceAfter : (await dai.balanceOf(lock.address)).toString(),
        })
        expect(
          await dai.balanceOf(lock.address)
        ).to.equal(lockBalanceBefore.add(keyPrice))
      })

      it('emit an event', async () => {
        // console.log(receipt)
        const { events } = receipt
        const { args } = events.find(({event}) => event === 'SwapCallRefund')
        console.log(args)
        expect(args.tokenAddress).to.equal(ADDRESS_ZERO)

        const balanceAfter = await ethers.provider.getBalance(keyOwner.address)
        const remaining = balanceBefore.sub(balanceAfter)
        expect(args.value).to.equal(remaining)
      })

      it('send back the excess tokens', async () => {
        const balanceAfter = await ethers.provider.getBalance(keyOwner.address)
        const remaining = balanceBefore.sub(balanceAfter)
        console.log(ethers.utils.formatEther(remaining))
        expect(remaining.gte(ethers.utils.parseEther('.09'))).to.equal(true)
      })

      it('refund user when lock call reverts')
    })

    // describe('extend')
  })

  // describe('use DAI with a lock priced in ETH')
  // describe('use USDC with a lock priced in DAI')
  // describe('use SHIBA INU with a lock priced in ETH')

})
