const { ethers } = require('hardhat')
const { expect } = require('chai')
const {
  getBalance,
  PERMIT2_ADDRESS,
  udtAddress,
  addSomeETH,
  addERC20,
  impersonate,
  getUniswapTokens,
  getNetwork,
  getUdt,
  getUnlock,
  ADDRESS_ZERO,
  // reverts,
} = require('@unlock-protocol/hardhat-helpers')

const { compareBigNumbers } = require('../helpers')

let scenarios

const routerAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564'
// const routerAddress = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45' // swaRouter02

describe(`swapAndBurn`, function () {
  let swapBurner, unlockAddress, tokenAddress, udt, unlock

  before(async function () {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }

    // mainnet fork: need to fund hardhat default signer
    const [signer] = await ethers.getSigners()
    await addSomeETH(signer.address)

    // get uniswap-formatted tokens
    const { chainId } = await ethers.provider.getNetwork()
    const { native, usdc, dai, wBtc, weth } = await getUniswapTokens(chainId)
    scenarios = [native, usdc, dai, wBtc, weth]

    // get mainnet values
    ;({
      // uniswapV3: { universalRouterAddress: routerAddress },
      unlockAddress,
    } = await getNetwork())
    udt = await getUdt()
    unlock = await getUnlock(unlockAddress)

    expect(await unlock.weth()).to.equal(weth.address)

    // deploy swapper
    const UnlockSwapBurner = await ethers.getContractFactory('UnlockSwapBurner')
    swapBurner = await UnlockSwapBurner.deploy(
      unlockAddress,
      PERMIT2_ADDRESS,
      routerAddress
    )
  })

  describe('constructor', () => {
    it('unlock is set properly', async () => {
      expect(await swapBurner.unlockAddress()).to.equal(unlockAddress)
    })
    it('uniswap routers are set properly', async () => {
      expect(await swapBurner.uniswapRouter()).to.equal(routerAddress)
    })
    it('permit2 is set properly', async () => {
      expect(await swapBurner.permit2()).to.equal(PERMIT2_ADDRESS)
    })
  })

  it('swaps', () => {
    scenarios.forEach((token) => {
      describe(`swap ${token.symbol} for UDT`, () => {
        let amount,
          balanceSwapBurnBefore,
          udtSwapBurnBalanceBefore,
          udtBurnAddressBalanceBefore,
          events

        before(async () => {
          amount = ethers.utils.parseUnits(
            token.isNative ? '1' : '50',
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
          expect(balance.toString()).to.equal(amount.toString())

          // burner has not udtAddress
          expect(
            (await getBalance(swapBurner.address, udt.address)).toString()
          ).to.equal('0')

          // transfer these token to burner
          const unlockSigner = await impersonate(unlockAddress)
          if (token.isNative) {
            await await unlockSigner.sendTransaction({
              to: swapBurner.address,
              value: amount,
            })
          } else {
            const tokenContract = await ethers.getContractAt(
              'IERC20',
              tokenAddress,
              unlockSigner
            )
            await tokenContract.transfer(swapBurner.address, amount)
          }

          // balances
          balanceSwapBurnBefore = await getBalance(
            swapBurner.address,
            tokenAddress
          )
          udtSwapBurnBalanceBefore = await getBalance(
            swapBurner.address,
            udtAddress
          )
          udtBurnAddressBalanceBefore = await getBalance(
            swapBurner.burnAddress(),
            udtAddress
          )

          expect(balanceSwapBurnBefore.toString()).to.equal(amount.toString())

          // lets go
          const tx = await swapBurner.swapAndBurn(tokenAddress, 3000)
          ;({ events } = await tx.wait())
        })

        it('swap the entire token balance', async () => {
          const balanceBurner = await getBalance(
            swapBurner.address,
            tokenAddress
          )
          compareBigNumbers(balanceBurner, '0')
        })

        it('UDT balance remains unchanged', async () => {
          const udtSwapBurn = await getBalance(swapBurner.address, udtAddress)
          compareBigNumbers(udtSwapBurn.sub(udtSwapBurnBalanceBefore), '0')
        })

        it('burns the entire UDT that have been swapped', async () => {
          const udtBurnAddressBalance = await getBalance(
            swapBurner.burnAddress(),
            udtAddress
          )
          compareBigNumbers(
            udtBurnAddressBalance.sub(udtBurnAddressBalanceBefore),
            '0'
          )
        })

        it('emits a SwapBurn event', async () => {
          console.log(events)
          const { args } = events.find(({ event }) => event === 'SwapBurn')
          expect(args.tokenAddress).to.equal(tokenAddress)
          compareBigNumbers(args.amountSpent, amount)

          const udtBurnAddressBalance = await getBalance(
            swapBurner.burnAddress(),
            udtAddress
          )
          console.log({
            udtBurnAddressBalanceBefore: udtBurnAddressBalanceBefore.toString(),
            udtBurnAddressBalance: udtBurnAddressBalance.toString(),
          })
          const amountBurn = udtBurnAddressBalanceBefore.sub(
            udtBurnAddressBalance
          )
          compareBigNumbers(args.amountBurnt, amountBurn)
        })
      })
    })
  })
})
