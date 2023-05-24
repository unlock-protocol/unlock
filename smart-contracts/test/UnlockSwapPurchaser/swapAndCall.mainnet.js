const { ethers } = require('hardhat')
const { expect } = require('chai')
const {
  getUniswapTokens,
  getUniswapRoute,
  ADDRESS_ZERO,
  deployLock,
  purchaseKey,
  getBalance,
  addERC20,
  UNLOCK_ADDRESS,
  PERMIT2_ADDRESS,
  CHAIN_ID,
  reverts,
} = require('../helpers')

const uniswapRouterAddresses = require('../../scripts/uniswap/routerAddresses.json')

// get uniswap-formatted tokens
const tokens = getUniswapTokens(CHAIN_ID)

const scenarios = [
  [tokens.native, tokens.dai],
  [tokens.native, tokens.usdc],
  [tokens.dai, tokens.usdc],
  [tokens.usdc, tokens.native],
  [tokens.udt, tokens.native],
  // [tokens.native, tokens.wBtc] // Uniswap SDK failsto generate route and parse calldata
]

describe(`swapAndCall`, function () {
  let unlock, swapPurchaser
  before(async function () {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }

    const { UniversalRouter, SwapRouter02 } = uniswapRouterAddresses[CHAIN_ID]
    const routers = [UniversalRouter, SwapRouter02]

    // get Unlock contract
    unlock = await ethers.getContractAt('Unlock', UNLOCK_ADDRESS)

    // deploy swapper
    const UnlockSwapPurchaser = await ethers.getContractFactory(
      'UnlockSwapPurchaser'
    )
    swapPurchaser = await UnlockSwapPurchaser.deploy(
      UNLOCK_ADDRESS,
      PERMIT2_ADDRESS,
      routers
    )
  })

  it('unlock is set properly', async () => {
    expect(await swapPurchaser.unlockAddress()).to.equal(UNLOCK_ADDRESS)
  })
  it('permit2 is set properly', async () => {
    expect(await swapPurchaser.permit2()).to.equal(PERMIT2_ADDRESS)
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
          isEthers: true,
        })
        expect(keyPrice.toString()).to.equal((await lock.keyPrice()).toString())
      })

      it('lock is set properly', async () => {
        expect(await lock.tokenAddress()).to.equal(
          lockToken.address || ADDRESS_ZERO
        )
        expect((await lock.balanceOf(keyOwner.address)).toNumber()).to.equal(0)
      })

      it(`signer has enough ${srcToken.symbol} to buy/renew a bunch of keys`, async () => {
        const balance = await getBalance(keyOwner.address, srcToken.address)
        expect(balance.gte(0)).to.equal(true)
      })

      describe('purchase', () => {
        let lockBalanceBefore, keyOwnerBalanceBefore
        before(async () => {
          lockBalanceBefore = await getBalance(lock.address, lockToken.address)
          keyOwnerBalanceBefore = await lock.balanceOf(keyOwner.address)

          const args = [
            lockToken.isToken ? [keyPrice] : [], // keyPrices
            [keyOwner.address], // recipients
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]], // _data
          ]

          // parse call data
          const calldata = await lock.interface.encodeFunctionData(
            'purchase',
            args
          )

          // get uniswap route
          ;({ swapCalldata, value, swapRouter, amountInMax } =
            await getUniswapRoute({
              tokenIn: srcToken,
              tokenOut: lockToken,
              amoutOut: keyPrice,
              recipient: swapPurchaser.address,
            }))

          // approve
          if (srcToken.isToken) {
            const token = await addERC20(
              srcToken.address,
              keyOwner.address,
              amountInMax
            )
            await token
              .connect(keyOwner)
              .approve(swapPurchaser.address, amountInMax)
          }

          // do the swap and call!
          await swapPurchaser.connect(keyOwner).swapAndCall(
            lock.address,
            srcToken.address || ADDRESS_ZERO,
            amountInMax, // value in src token
            swapRouter,
            swapCalldata,
            calldata,
            { value }
          )
        })

        it('purchase a key for the sender', async () => {
          expect((await lock.balanceOf(keyOwner.address)).toNumber()).to.equal(
            keyOwnerBalanceBefore.toNumber() + 1
          )
        })

        it('lock has received the tokens', async () => {
          expect(
            (await getBalance(lock.address, lockToken.address)).toString()
          ).to.equal(lockBalanceBefore.plus(keyPrice.toString()).toString())
        })
      })

      describe('extend', async () => {
        let tokenId, lockBalanceBefore
        before(async () => {
          // give our buyer some ERC20 tokens to first buy a key
          if (lockToken.isToken) {
            const token = await addERC20(
              lockToken.address,
              keyOwner.address,
              keyPrice
            )
            assert((await token.balanceOf(keyOwner.address)).gte(keyPrice))
            await token.connect(keyOwner).approve(lock.address, keyPrice)
          }

          // purchase the key
          const isErc20 = lockToken.isToken
          ;({ tokenId } = await purchaseKey(
            lock,
            keyOwner.address,
            isErc20,
            keyPrice
          ))
          assert.equal(await lock.isValidKey(tokenId), true)

          // expire the key
          await lock.expireAndRefundFor(tokenId, 0)
          assert.equal(await lock.isValidKey(tokenId), false)

          // parse extend calldata
          const extendArgs = [keyPrice, tokenId, ADDRESS_ZERO, []]
          const calldata = lock.interface.encodeFunctionData(
            'extend',
            extendArgs
          )
          lockBalanceBefore = await getBalance(lock.address, lockToken.address)

          // get uniswap route
          ;({ swapCalldata, value, swapRouter, amountInMax } =
            await getUniswapRoute({
              tokenIn: srcToken,
              tokenOut: lockToken,
              amoutOut: keyPrice,
              recipient: swapPurchaser.address,
            }))

          // approve our src token that will be swapped
          if (srcToken.isToken) {
            const token = await addERC20(
              srcToken.address,
              keyOwner.address,
              amountInMax
            )
            await token
              .connect(keyOwner)
              .approve(swapPurchaser.address, amountInMax)
          }

          // do the swap and call
          await swapPurchaser.connect(keyOwner).swapAndCall(
            lock.address,
            srcToken.address || ADDRESS_ZERO,
            amountInMax, // (in src token)
            swapRouter,
            swapCalldata,
            calldata,
            { value }
          )
        })

        it('key is now valid', async () => {
          assert.equal(await lock.isValidKey(tokenId), true)
        })

        it('lock has received the tokens', async () => {
          const balance = await getBalance(lock.address, lockToken.address)
          expect(balance.toString()).to.equal(
            lockBalanceBefore.plus(keyPrice.toString()).toString()
          )
        })
      })

      describe('errors', () => {
        let calldata
        before(async () => {
          const args = [
            lockToken.isToken ? [keyPrice] : [], // keyPrices
            [keyOwner.address], // recipients
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]], // _data
          ]

          // parse call data
          calldata = await lock.interface.encodeFunctionData('purchase', args)

          // get uniswap route
          ;({ swapCalldata, value, swapRouter, amountInMax } =
            await getUniswapRoute({
              tokenIn: srcToken,
              tokenOut: lockToken,
              amoutOut: keyPrice,
              recipient: swapPurchaser.address,
            }))

          // approve
          if (srcToken.isToken) {
            const token = await addERC20(
              srcToken.address,
              keyOwner.address,
              amountInMax
            )
            await token
              .connect(keyOwner)
              .approve(swapPurchaser.address, amountInMax)
          }
        })

        describe('swap reverts if', () => {
          it('calldata is wrong', async () => {
            const corruptCallData = swapCalldata
              .replace('a', 'b')
              .replace('1', '2')
            await reverts(
              swapPurchaser.connect(keyOwner).swapAndCall(
                lock.address,
                srcToken.address || ADDRESS_ZERO,
                amountInMax, // (in src token)
                swapRouter,
                corruptCallData,
                calldata,
                { value }
              ),
              'SwapFailed'
            )
          })

          it('the ERC20 allowance is unsufficient', async () => {
            if (srcToken.isToken) {
              // skip test if native token
              // give some tokens
              const token = await addERC20(
                srcToken.address,
                keyOwner.address,
                amountInMax
              )

              // reset approval
              await token.connect(keyOwner).approve(swapPurchaser.address, 0)

              await reverts(
                swapPurchaser
                  .connect(keyOwner)
                  .swapAndCall(
                    lock.address,
                    srcToken.address || ADDRESS_ZERO,
                    amountInMax,
                    swapRouter,
                    swapCalldata,
                    calldata,
                    { value }
                  ),
                'SwapFailed'
              )
            }
          })
        })

        describe('lock call reverts if', () => {
          it('calldata is wrong', async () => {
            const corruptCallData = swapCalldata
              .replace('a', 'b')
              .replace('1', '2')
            await reverts(
              swapPurchaser.connect(keyOwner).swapAndCall(
                lock.address,
                srcToken.address || ADDRESS_ZERO,
                amountInMax, // (in src token)
                swapRouter,
                swapCalldata,
                corruptCallData,
                { value }
              ),
              'LockCallFailed'
            )
          })

          it('key price is unsufficient', async () => {
            ;({ swapCalldata, value, swapRouter, amountInMax } =
              await getUniswapRoute({
                tokenIn: srcToken,
                tokenOut: lockToken,
                amoutOut: keyPrice.div(2),
                recipient: swapPurchaser.address,
              }))

            // approve
            if (srcToken.isToken) {
              const token = await addERC20(
                srcToken.address,
                keyOwner.address,
                amountInMax
              )
              await token
                .connect(keyOwner)
                .approve(swapPurchaser.address, amountInMax)
            }

            await reverts(
              swapPurchaser.connect(keyOwner).swapAndCall(
                lock.address,
                srcToken.address || ADDRESS_ZERO,
                amountInMax, // (in src token)
                swapRouter,
                swapCalldata,
                calldata,
                { value }
              ),
              'InsufficientBalance'
            )
          })
        })
      })
    })
  })
})
