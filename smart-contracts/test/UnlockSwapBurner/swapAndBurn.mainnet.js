const { ethers } = require('hardhat')
const { expect } = require('chai')
const {
  getBalance,
  PERMIT2_ADDRESS,
  UDT,
  addSomeETH,
  addERC20,
  impersonate,
  getUDTSwapPath,
  getUniswapTokens,
  getNetwork,
  getUdt,
  ADDRESS_ZERO,
  // reverts,
} = require('@unlock-protocol/hardhat-helpers')

let scenarios
describe(`swapAndBurn`, function () {
  let swapBurner, unlockAddress, routerAddress, tokenAddress, udt
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
    const { native, usdc, dai, wBtc } = await getUniswapTokens(chainId)
    scenarios = [native, usdc, dai, wBtc]

    // get mainnet values
    ;({
      uniswapV3: { universalRouterAddress: routerAddress },
      unlockAddress,
    } = await getNetwork())
    udt = await getUdt()

    // deploy swapper
    const UnlockSwapBurner = await ethers.getContractFactory('UnlockSwapBurner')
    swapBurner = await UnlockSwapBurner.deploy(udt.address, PERMIT2_ADDRESS, [
      routerAddress,
    ])
  })

  describe('constructor', () => {
    it('udt is set properly', async () => {
      expect(await swapBurner.udtAddress()).to.equal(udt.address)
    })
    it('uniswap routers are set properly', async () => {
      expect(await swapBurner.uniswapRouters(routerAddress)).to.be.true
    })
    it('permit2 is set properly', async () => {
      expect(await swapBurner.permit2()).to.equal(PERMIT2_ADDRESS)
    })
  })

  it('swaps', () => {
    scenarios.forEach((token) => {
      describe(`swap ${token.symbol} for UDT`, () => {
        let amount
        before(async () => {
          amount = ethers.utils.parseUnits('50', token.decimals)
          tokenAddress = token.address || ADDRESS_ZERO

          // Unlock has some token
          if (token.isNative) {
            await addSomeETH(unlockAddress, amount)
          } else {
            await addERC20(tokenAddress, unlockAddress, amount)
          }
          const balance = await getBalance(unlockAddress, tokenAddress)
          expect(balance.toString()).to.equal(amount.toString())

          // burner has not UDT
          expect(
            (await getBalance(swapBurner.address, UDT)).toString()
          ).to.equal('0')

          // transfer these token to burner
          const unlockSigner = await impersonate(unlockAddress)
          if (!token.isNative) {
            const tokenContract = await ethers.getContractAt(
              'IERC20',
              tokenAddress,
              unlockSigner
            )
            await tokenContract.transfer(swapBurner.address, amount)
          } else {
            await await unlockSigner.sendTransaction({
              to: swapBurner.address,
              value: amount,
            })
          }
          const balanceBurner = await getBalance(
            swapBurner.address,
            tokenAddress
          )
          expect(balanceBurner.toString()).to.equal(amount.toString())
        })

        it('burns token entire balance', async () => {
          const { path, value, swapRouter } = await getUDTSwapPath({
            amountIn: amount,
            tokenIn: token,
            recipient: swapBurner.address,
          })
          const balanceBurnerBefore = await getBalance(
            swapBurner.address,
            tokenAddress
          )
          const udtBalanceBurnerBefore = await getBalance(
            swapBurner.address,
            UDT
          )

          await swapBurner.swapAndBurn(tokenAddress, swapRouter, amount, path, {
            value,
          })
          const balanceBurner = await getBalance(
            swapBurner.address,
            tokenAddress
          )
          expect(balanceBurnerBefore.minus(balanceBurner).toString()).to.equal(
            '0'
          )
          const udtBalanceBurner = await getBalance(swapBurner.address, UDT)
          expect(
            udtBalanceBurner.minus(udtBalanceBurnerBefore).get(0)
          ).to.equal(true)
        })
      })
    })
  })
})
