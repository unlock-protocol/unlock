const assert = require('assert')
const { ethers } = require('hardhat')
const { deployLock, purchaseKey, getUnlock, reverts } = require('../helpers')

const {
  uniswapRouterAddresses,
  getUniswapTokens,
  getUniswapRoute,
  ADDRESS_ZERO,
  PERMIT2_ADDRESS,
  getBalance,
  addERC20,
} = require('@unlock-protocol/hardhat-helpers')

let scenarios = []

describe(`swapAndCall`, function () {
  let unlock, swapPurchaser, tokens
  before(async function () {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }
    // get uniswap-formatted tokens
    const { chainId } = await ethers.provider.getNetwork()
    tokens = await getUniswapTokens(chainId)

    scenarios = [
      [tokens.native, tokens.dai],
      [tokens.native, tokens.usdc],
      [tokens.dai, tokens.usdc],
      [tokens.usdc, tokens.native],
      [tokens.udt, tokens.native],
      // [tokens.native, tokens.wBtc] // Uniswap SDK failsto generate route and parse calldata
    ]

    const { UniversalRouter, SwapRouter02 } = uniswapRouterAddresses[chainId]
    const routers = [UniversalRouter, SwapRouter02]

    // get Unlock contract
    unlock = await getUnlock()

    // deploy swapper
    const UnlockSwapPurchaser = await ethers.getContractFactory(
      'UnlockSwapPurchaser'
    )
    swapPurchaser = await UnlockSwapPurchaser.deploy(
      await unlock.getAddress(),
      PERMIT2_ADDRESS,
      routers
    )
  })

  it('unlock is set properly', async () => {
    assert.equal(await swapPurchaser.unlockAddress(), await unlock.getAddress())
  })
  it('permit2 is set properly', async () => {
    assert.equal(await swapPurchaser.permit2(), PERMIT2_ADDRESS)
  })

  it('swaps', () => {
    scenarios.forEach(([srcToken, lockToken]) => {
      let keyOwner, lock, keyPrice
      let swapCalldata, value, swapRouter, amountInMax
      describe(`use ${srcToken.symbol} with a lock priced in ${lockToken.symbol}`, () => {
        before(async () => {
          ;[, keyOwner] = await ethers.getSigners()
          // parse token decimals properly (100 USDC or 1 ETH)
          keyPrice = ethers.parseUnits(
            lockToken.symbol === 'USDC' ? '100' : '1',
            lockToken.decimals
          )
          lock = await deployLock({
            unlock,
            tokenAddress: await lockToken.getAddress(),
            // make sure we can add multiple keys
            maxKeysPerAddress: 100,
            keyPrice,
            isEthers: true,
          })
          assert.equal(keyPrice, await lock.keyPrice())
        })

        it('lock is set properly', async () => {
          assert.equal(
            await lock.tokenAddress(),
            (await lockToken.getAddress()) || ADDRESS_ZERO
          )
          assert.equal(await lock.balanceOf(await keyOwner.getAddress()), 0)
        })

        it(`signer has enough ${srcToken.symbol} to buy/renew a bunch of keys`, async () => {
          const balance = await getBalance(
            await keyOwner.getAddress(),
            await srcToken.getAddress()
          )
          assert.equal(balance >= 0, true)
        })

        describe('purchase', () => {
          let lockBalanceBefore, keyOwnerBalanceBefore
          before(async () => {
            lockBalanceBefore = await getBalance(
              await lock.getAddress(),
              await lockToken.getAddress()
            )
            keyOwnerBalanceBefore = await lock.balanceOf(
              await keyOwner.getAddress()
            )

            const args = [
              lockToken.isToken ? [keyPrice] : [], // keyPrices
              [await keyOwner.getAddress()], // recipients
              [ADDRESS_ZERO],
              [ADDRESS_ZERO],
              ['0x'], // _data
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
                recipient: await swapPurchaser.getAddress(),
              }))

            // approve
            if (srcToken.isToken) {
              const token = await addERC20(
                await srcToken.getAddress(),
                await keyOwner.getAddress(),
                amountInMax
              )
              await token
                .connect(keyOwner)
                .approve(await swapPurchaser.getAddress(), amountInMax)
            }

            // do the swap and call!
            await swapPurchaser.connect(keyOwner).swapAndCall(
              await lock.getAddress(),
              (await srcToken.getAddress()) || ADDRESS_ZERO,
              amountInMax, // value in src token
              swapRouter,
              swapCalldata,
              calldata,
              { value }
            )
          })

          it('purchase a key for the sender', async () => {
            assert.equal(
              await lock.balanceOf(await keyOwner.getAddress()),
              keyOwnerBalanceBefore + 1
            )
          })

          it('lock has received the tokens', async () => {
            assert.equal(
              await getBalance(
                await lock.getAddress(),
                await lockToken.getAddress()
              ),
              lockBalanceBefore.plus(keyPrice)
            )
          })
        })

        describe('extend', async () => {
          let tokenId, lockBalanceBefore
          before(async () => {
            // give our buyer some ERC20 tokens to first buy a key
            if (lockToken.isToken) {
              const token = await addERC20(
                await lockToken.getAddress(),
                await keyOwner.getAddress(),
                keyPrice
              )
              assert(
                (await token.balanceOf(await keyOwner.getAddress())) >= keyPrice
              )
              await token
                .connect(keyOwner)
                .approve(await lock.getAddress(), keyPrice)
            }

            // purchase the key
            const isErc20 = lockToken.isToken
            ;({ tokenId } = await purchaseKey(
              lock,
              await keyOwner.getAddress(),
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
            lockBalanceBefore = await getBalance(
              await lock.getAddress(),
              await lockToken.getAddress()
            )

            // get uniswap route
            ;({ swapCalldata, value, swapRouter, amountInMax } =
              await getUniswapRoute({
                tokenIn: srcToken,
                tokenOut: lockToken,
                amoutOut: keyPrice,
                recipient: await swapPurchaser.getAddress(),
              }))

            // approve our src token that will be swapped
            if (srcToken.isToken) {
              const token = await addERC20(
                await srcToken.getAddress(),
                await keyOwner.getAddress(),
                amountInMax
              )
              await token
                .connect(keyOwner)
                .approve(await swapPurchaser.getAddress(), amountInMax)
            }

            // do the swap and call
            await swapPurchaser.connect(keyOwner).swapAndCall(
              await lock.getAddress(),
              (await srcToken.getAddress()) || ADDRESS_ZERO,
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
            const balance = await getBalance(
              await lock.getAddress(),
              await lockToken.getAddress()
            )
            assert.equal(balance, lockBalanceBefore.plus(keyPrice))
          })
        })

        describe('errors', () => {
          let calldata
          before(async () => {
            const args = [
              lockToken.isToken ? [keyPrice] : [], // keyPrices
              [await keyOwner.getAddress()], // recipients
              [ADDRESS_ZERO],
              [ADDRESS_ZERO],
              ['0x'], // _data
            ]

            // parse call data
            calldata = await lock.interface.encodeFunctionData('purchase', args)

            // get uniswap route
            ;({ swapCalldata, value, swapRouter, amountInMax } =
              await getUniswapRoute({
                tokenIn: srcToken,
                tokenOut: lockToken,
                amoutOut: keyPrice,
                recipient: await swapPurchaser.getAddress(),
              }))

            // approve
            if (srcToken.isToken) {
              const token = await addERC20(
                await srcToken.getAddress(),
                await keyOwner.getAddress(),
                amountInMax
              )
              await token
                .connect(keyOwner)
                .approve(await swapPurchaser.getAddress(), amountInMax)
            }
          })

          describe('swap reverts if', () => {
            it('calldata is wrong', async () => {
              const corruptCallData = swapCalldata
                .replace('a', 'b')
                .replace('1', '2')
              await reverts(
                swapPurchaser.connect(keyOwner).swapAndCall(
                  await lock.getAddress(),
                  (await srcToken.getAddress()) || ADDRESS_ZERO,
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
                  await srcToken.getAddress(),
                  await keyOwner.getAddress(),
                  amountInMax
                )

                // reset approval
                await token
                  .connect(keyOwner)
                  .approve(await swapPurchaser.getAddress(), 0)

                await reverts(
                  swapPurchaser
                    .connect(keyOwner)
                    .swapAndCall(
                      await lock.getAddress(),
                      (await srcToken.getAddress()) || ADDRESS_ZERO,
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
                  await lock.getAddress(),
                  (await srcToken.getAddress()) || ADDRESS_ZERO,
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
                  amoutOut: keyPrice / 2,
                  recipient: await swapPurchaser.getAddress(),
                }))

              // approve
              if (srcToken.isToken) {
                const token = await addERC20(
                  await srcToken.getAddress(),
                  await keyOwner.getAddress(),
                  amountInMax
                )
                await token
                  .connect(keyOwner)
                  .approve(await swapPurchaser.getAddress(), amountInMax)
              }

              await reverts(
                swapPurchaser.connect(keyOwner).swapAndCall(
                  await lock.getAddress(),
                  (await srcToken.getAddress()) || ADDRESS_ZERO,
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
})
