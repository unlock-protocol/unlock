const { ethers } = require('hardhat')
const assert = require('assert')
const {
  getBalance,
  PERMIT2_ADDRESS,
  addSomeETH,
  addERC20,
  impersonate,
  getNetwork,
  getUnlock,
  ADDRESS_ZERO,
  getEvent,
  // reverts,
} = require('@unlock-protocol/hardhat-helpers')

const { compareBigNumbers } = require('../helpers')
const { ZeroAddress } = require('ethers')

let scenarios

describe(`swapAndBurn`, function () {
  let chainId,
    tokens,
    swapBurner,
    unlockAddress,
    tokenAddress,
    udtAddress,
    wrappedAddress,
    unlock,
    universalRouterAddress,
    burnAddress

  before(async function () {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }

    // mainnet fork: need to fund hardhat default signer
    const [signer] = await ethers.getSigners()
    await addSomeETH(await signer.getAddress())
    // get mainnet values
    ;({
      id: chainId,
      unlockAddress,
      tokens,
      uniswapV3: { universalRouterAddress },
    } = await getNetwork())

    // get uniswap-formatted tokens
    const native = { decimals: 18, isNative: true, symbol: 'ETH' }
    scenarios = [
      ...tokens.filter(({ symbol }) =>
        ['USDC', 'DAI', 'WETH'].includes(symbol)
      ),
      native,
    ]

    unlock = await getUnlock(unlockAddress)
    udtAddress = await unlock.udt()
    wrappedAddress = await unlock.weth()

    // deploy swapper
    const UnlockSwapBurner = await ethers.getContractFactory('UnlockSwapBurner')
    swapBurner = await UnlockSwapBurner.deploy(
      unlockAddress,
      PERMIT2_ADDRESS,
      universalRouterAddress
    )

    burnAddress = await swapBurner.burnAddress()
  })

  describe('constructor', () => {
    it('unlock is set properly', async () => {
      assert.equal(await swapBurner.unlockAddress(), unlockAddress)
    })
    it('uniswap routers are set properly', async () => {
      assert.equal(
        await swapBurner.uniswapUniversalRouter(),
        universalRouterAddress
      )
    })
    it('permit2 is set properly', async () => {
      assert.equal(await swapBurner.permit2(), PERMIT2_ADDRESS)
    })
  })

  it('swaps', () => {
    scenarios.forEach((token) => {
      describe(`swap ${token.symbol} for UDT`, () => {
        let amount,
          balanceSwapBurnBefore,
          udtSwapBurnBalanceBefore,
          udtBurnAddressBalanceBefore,
          receipt

        before(async () => {
          amount = ethers.parseUnits(
            token.isNative || token.address == wrappedAddress ? '1' : '50',
            token.decimals
          )
          tokenAddress = token.address || ADDRESS_ZERO

          // Unlock has some token
          if (token.isNative) {
            await addSomeETH(unlockAddress, amount)
          } else {
            await addERC20(tokenAddress, unlockAddress, amount)
          }
          const balance = await getBalance(unlockAddress, tokenAddress)
          assert.equal(balance >= amount, true)

          // burner has no UDT
          assert.equal(
            await getBalance(await swapBurner.getAddress(), udtAddress),
            '0'
          )

          // transfer these token to burner
          const unlockSigner = await impersonate(unlockAddress)
          if (token.isNative) {
            await await unlockSigner.sendTransaction({
              to: await swapBurner.getAddress(),
              value: amount,
            })
          } else {
            const tokenContract = await ethers.getContractAt(
              'IERC20',
              tokenAddress,
              unlockSigner
            )
            await tokenContract.transfer(await swapBurner.getAddress(), amount)
          }

          // balances
          balanceSwapBurnBefore = await getBalance(
            await swapBurner.getAddress(),
            tokenAddress
          )
          udtSwapBurnBalanceBefore = await getBalance(
            await swapBurner.getAddress(),
            udtAddress
          )
          udtBurnAddressBalanceBefore = await getBalance(
            burnAddress,
            udtAddress
          )

          assert.equal(balanceSwapBurnBefore, amount)

          // lets go
          const tx = await swapBurner.swapAndBurn(tokenAddress, 3000)
          receipt = await tx.wait()
        })

        it('wiped the entire token balance', async () => {
          const balanceBurner = await getBalance(
            await swapBurner.getAddress(),
            tokenAddress
          )
          compareBigNumbers(balanceBurner, '0')
        })

        it('UDT balance remains unchanged', async () => {
          const udtSwapBurn = await getBalance(
            await swapBurner.getAddress(),
            udtAddress
          )
          compareBigNumbers(udtSwapBurn - udtSwapBurnBalanceBefore, '0')
        })

        it('burns the entire UDT that have been swapped', async () => {
          const {
            args: { amountBurnt },
          } = await getEvent(receipt, 'SwapBurn')
          const udtBurnAddressBalance = await getBalance(
            burnAddress,
            udtAddress
          )

          compareBigNumbers(
            udtBurnAddressBalance - udtBurnAddressBalanceBefore,
            amountBurnt
          )
        })

        it('emits a SwapBurn event', async () => {
          const { args } = await getEvent(receipt, 'SwapBurn')
          assert.equal(
            tokenAddress,
            token.isNative ? ZeroAddress : tokenAddress
          )
          compareBigNumbers(args.amountSpent, amount)

          const udtBurnAddressBalance = await getBalance(
            burnAddress,
            udtAddress
          )
          compareBigNumbers(
            args.amountBurnt,
            udtBurnAddressBalance - udtBurnAddressBalanceBefore
          )
        })
      })
    })
  })
})
