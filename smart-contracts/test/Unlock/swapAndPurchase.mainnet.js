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
  WETH,
  addERC20,
  PERMIT2_ADDRESS
 } = require('../helpers')

// get unlock address in mainnet
const { networks : { 1 : { unlockAddress }} } = unlock

// some whales
const UNLOCK_PROXY_OWNER = '0xF867712b963F00BF30D372b857Ae7524305A0CE7'

// get uniswap-formatted tokens
const tokens = getUniswapTokens()

// TODO: add wBTC, UDT
const scenarios = [
  [tokens.native, tokens.dai],
  [tokens.native, tokens.usdc],
  [tokens.dai, tokens.usdc],
  [tokens.usdc, tokens.native],
  // [tokens.usdc, tokens.shiba]
]

describe(`swapAndCall`, function() {

  let unlock
  before(async function() {
    if (!process.env.RUN_FORK) {
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
    
    // config unlock
    await unlock.connect(unlockOwner).configUnlock(
      ADDRESS_ZERO, // udt
      WETH,
      16000, // gasEstimate
      'KEY_SWAP',
      'http://locksmith:8080/api/key/',
      1, // mainnet fork
    )

    // config permit2
    await unlock.connect(unlockOwner).setPermit2(PERMIT2_ADDRESS);
  })

  it('permit2 is set properly', async () => {
    expect(await unlock.permit2()).to.equal(PERMIT2_ADDRESS)
  })

  scenarios.forEach(([srcToken, lockToken]) => {
    let keyOwner, lock, keyPrice
    let swapCalldata, value, swapRouter, amountInMax
    describe(`use ${srcToken.symbol} with a lock priced in ${lockToken.symbol}`, () => {
      before(async () => {
        ;[, keyOwner] = await ethers.getSigners()
        // parse token decimals properly (100 USDC or 1 ETH)
        keyPrice = ethers.utils.parseUnits(
          lockToken.symbol === 'USDC' ? '100' : '1', 
          lockToken.decimals
        )
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
         } = await getUniswapRoute({
          tokenIn: srcToken,
          tokenOut: lockToken,
          amoutOut: keyPrice,
          recipient: unlock.address,
        }))
      })

      it('lock is set properly', async () => {
        expect(await lock.tokenAddress()).to.equal(lockToken.address || ADDRESS_ZERO)
        expect(
          (await lock.balanceOf(keyOwner.address)).toNumber()
        ).to.equal(0)
      })

      it(`signer has enough ${srcToken.symbol} to buy/renew a bunch of keys`, async () => {
        const balance = await getBalance(keyOwner.address, srcToken.address)
        expect((balance).gte(0)).to.equal(true)
      })

      describe('purchase', () => {
        let lockBalanceBefore, keyOwnerBalanceBefore
        before(async () => {
          lockBalanceBefore = await getBalance(lock.address, lockToken.address)
          keyOwnerBalanceBefore = await lock.balanceOf(keyOwner.address)

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
            const token = await addERC20(srcToken.address, keyOwner.address, amountInMax)
            await token.connect(keyOwner).approve(unlock.address, amountInMax)
          }

          // do the swap
          await unlock.connect(keyOwner)
            .swapAndCall(
              lock.address,
              srcToken.address || ADDRESS_ZERO,
              amountInMax, // value in src token
              swapRouter,
              swapCalldata,
              calldata,
              { value }
            )
        })

        it('purchase a key for the sender', async() => {
          expect(
            (await lock.balanceOf(keyOwner.address)).toNumber()
          ).to.equal(
            keyOwnerBalanceBefore.toNumber() + 1
          )
        })
        
        it('lock has received the tokens', async () => {
          expect(
            (await getBalance(lock.address, lockToken.address)).toString()
          ).to.equal(
            lockBalanceBefore.plus(keyPrice.toString()).toString()
          )
        })
      })

      describe('extend', async () => {
        let tokenId, lockBalanceBefore
        before(async () => {    

          // give our buyer some ERC20 tokens to first buy a key
          if(lockToken.isToken) {
            const token = await addERC20(lockToken.address, keyOwner.address, keyPrice)
            assert((await token.balanceOf(keyOwner.address)).gte(keyPrice))
            await token.connect(keyOwner).approve(lock.address, keyPrice)
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

          // approve our src token that will be swapped
          if(srcToken.isToken) {
            const token = await addERC20(srcToken.address, keyOwner.address, amountInMax)
            await token.connect(keyOwner).approve(unlock.address, amountInMax)
          }
          
          // do the swap and call
          const tx = await unlock.connect(keyOwner)
            .swapAndCall(
              lock.address,
              srcToken.address || ADDRESS_ZERO,
              amountInMax, // (in src token)
              swapRouter,
              swapCalldata,
              calldata,
              { value }
            )

          console.log(tx)
        })
  
        it('key is now valid', async () => {
          assert.equal(await lock.isValidKey(tokenId), true)
        })
  
        it('lock has received the tokens', async () => {
          const balance = await getBalance(lock.address, lockToken.address)
          expect(
            balance.toString()
          ).to.equal(
            lockBalanceBefore.plus(keyPrice.toString()).toString()
          )
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
