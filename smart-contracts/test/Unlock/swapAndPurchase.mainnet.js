const { ethers, unlock, upgrades } = require('hardhat')
const { expect } = require('chai')
const { 
  impersonate, 
  getUniswapTokens, 
  getUniswapRoute,
  ADDRESS_ZERO, 
  deployLock, 
  purchaseKey,
  getBalance,
  DAI,
  USDC,
  WETH
 } = require('../helpers')

// get unlock address in mainnet
const { networks : { 1 : { unlockAddress }} } = unlock

// some whales
const UNLOCK_PROXY_OWNER = '0xF867712b963F00BF30D372b857Ae7524305A0CE7'

// get uniswap-formatted tokens
const tokens = getUniswapTokens()

const whales = {
  [DAI]: '0x075e72a5eDf65F0A5f44699c7654C1a76941Ddc8',
  [USDC]: '0xf977814e90da44bfa03b6295a0616a897441acec' // binance
}

// TODO: add wBTC
const scenarios = [
  // [tokens.native, tokens.dai],
  // [tokens.native, tokens.usdc],
  // [tokens.dai, tokens.usdc],
  [tokens.usdc, tokens.native],
  // [tokens.usdc, tokens.shiba]
]

async function fund(token, keyOwner, amountInMax) {
  const whale = await ethers.getSigner(whales[token.address])
  await impersonate(whale.address)

  const erc20Contract = await ethers.getContractAt('TestERC20', token.address)
  await erc20Contract.connect(whale).transfer(keyOwner.address, amountInMax)
  return erc20Contract
}

describe(`swapAndCall`, function() {

  let unlock
  before(async function() {
    if (!process.env.RUN_MAINNET_FORK) {
      // all suite will be skipped
      this.skip()
    }

    // get Unlock contract
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
    )
  })

  scenarios.forEach(([srcToken, lockToken]) => {
    let keyOwner, lock, keyPrice
    let swapCalldata, value, swapRouter, amountInMax
    describe(`use ${srcToken.symbol} with a lock priced in ${lockToken.symbol}`, () => {
      before(async () => {
        ;[, keyOwner] = await ethers.getSigners()
        // parse token decimals properly
        keyPrice = ethers.utils.parseUnits('1', lockToken.decimals)
        lock = await deployLock({ 
          unlock,
          tokenAddress: lockToken.address,
          // make sure we can add multiple keys
          maxKeysPerAddress: 100,
          keyPrice,
          isEthers: true
        })
        expect(keyPrice.toString()).to.equal((await lock.keyPrice()).toString())

        // get uniswap route
        // NB: we reuse the same route calldata for purchase and renew (faster)
        ;({ 
          swapCalldata, 
          value, 
          swapRouter,
          amountInMax
         } = await getUniswapRoute(
          srcToken, 
          lockToken, 
          keyPrice,
          unlock.address
        ))

      })

      it('lock is set properly', async () => {
        expect(await lock.tokenAddress()).to.equal(lockToken.address)
        expect(
          (await lock.balanceOf(keyOwner.address)).toNumber()
        ).to.equal(0)
      })

      it(`signer has enough ${srcToken.symbol} to buy/renew a bunch of keys`, async () => {
        const balance = await getBalance(keyOwner.address, srcToken.address)
        expect((balance).gte(0)).to.equal(true)
      })

      describe('purchase', () => {
        let lockBalanceBefore
        before(async () => {
          lockBalanceBefore = await getBalance(lock.address, lockToken.address)

          const args = [
            lockToken.isToken ? [keyPrice]: [], // keyPrices
            [keyOwner.address], // recipients
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]], // _data
          ]
  
          // parse call data
          const calldata = await lock.interface.encodeFunctionData('purchase', args)

          // approve
          if(srcToken.isToken) {
            const token = await fund(srcToken, keyOwner, amountInMax)
            await token.connect(keyOwner).approve(unlock.address, amountInMax)
          }

          // do the swap
          await unlock.connect(keyOwner)
            .swapAndCall(
              lock.address,
              srcToken.address || ADDRESS_ZERO,
              amountInMax, // value in ETH
              swapRouter,
              swapCalldata,
              calldata,
              { value }
            )
        })

        it('purchase a key for the sender', async() => {
          expect(
            (await lock.balanceOf(keyOwner.address)).toNumber()
          ).to.equal(1)
        })
        
        it('lock has received the tokens', async () => {
          expect(
            await getBalance(lock.address, lockToken.address)
          ).to.equal(lockBalanceBefore.add(keyPrice).toString())
        })
      })

      describe('extend', async () => {
        let tokenId, lockBalanceBefore
        before(async () => {    

          // give our buyer some ERC20 tokens if needed
          if(lockToken.isToken) {
            const token = await fund(srcToken)
            assert((await token.balanceOf(keyOwner.address)).gt(keyPrice))
            await token.connect(keyOwner).approve(lock.address, keyPrice.mul(1))
          }

          // purchase the key
          const isErc20 = lockToken.isToken
          ;({tokenId} = await purchaseKey(lock, keyOwner.address, isErc20, keyPrice))
          assert.equal(await lock.isValidKey(tokenId), true)
  
          // expire the key
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
          lockBalanceBefore = await getBalance(lock.address, lockToken.address)
          
          // do the swap and call
          await unlock.connect(keyOwner)
            .swapAndCall(
              lock.address,
              srcToken.address || ADDRESS_ZERO,
              amountInMax, // (in ETH)
              swapRouter,
              swapCalldata,
              calldata,
              { value: srcToken.isNative ? amountInMax : 0 }
            )
        })
  
        it('key is now valid', async () => {
          assert.equal(await lock.isValidKey(tokenId), true)
        })
  
        it('lock has received the tokens', async () => {
          const balance = await getBalance(lock.address, lockToken.address)
          expect(
            balance.gte(lockBalanceBefore.plus(keyPrice)
          ).to.be.true)
        })
      })
    })
  })


  // TODO: make sure everything fails gracefully
  // TODO: convert to custom errors
  describe('errors', () => {
    it('reverts if swap fails')
    it('reverts if lock call fails')
    it('pair does not exist (SHIBA/DAI)')
    it('the amount of tokens is not sufficient')
    it('the approval is unsufficient')
    it('pool fee is wrong')
  })
})
