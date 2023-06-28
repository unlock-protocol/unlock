const { ethers } = require('hardhat')
const { expect } = require('chai')
const { networks } = require('@unlock-protocol/networks')
const {
  getBalance,
  PERMIT2_ADDRESS,
  CHAIN_ID,
  UDT,
  addSomeETH,
  addERC20,
  impersonate,
  getUDTSwapRoute,
  getUniswapTokens,
  getUniswapRouters,
  ADDRESS_ZERO,
  // reverts,
} = require('../helpers')

// get uniswap-formatted tokens
const { native, usdc, dai, wBtc } = getUniswapTokens(CHAIN_ID)
const scenarios = [native, usdc, dai, wBtc]

describe(`swapAndBurn`, function () {
  let swapBurner, unlockAddress, routers, tokenAddress
  before(async function () {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }

    // fund signer
    const [signer] = await ethers.getSigners()
    await addSomeETH(signer.address)

    const { chainId } = await ethers.provider.getNetwork()
    routers = getUniswapRouters(chainId)
    ;({ unlockAddress } = networks[chainId])

    // deploy swapper
    const UnlockSwapBurner = await ethers.getContractFactory('UnlockSwapBurner')
    swapBurner = await UnlockSwapBurner.deploy(UDT, PERMIT2_ADDRESS, routers)
  })

  describe('constructor', () => {
    it('udt is set properly', async () => {
      expect(await swapBurner.udtAddress()).to.equal(UDT)
    })
    it('uniswap routers are set properly', async () => {
      expect(await swapBurner.uniswapRouters(routers[0])).to.be.true
      expect(await swapBurner.uniswapRouters(routers[1])).to.be.true
    })
    it('permit2 is set properly', async () => {
      expect(await swapBurner.permit2()).to.equal(PERMIT2_ADDRESS)
    })
  })

  scenarios.forEach((token) => {
    describe(`swap ${token.symbol} for UDT`, () => {
      let amount
      before(async () => {
        amount = ethers.utils.parseUnits('50', token.decimals)
        tokenAddress = tokenAddress || ADDRESS_ZERO

        // Unlock has some token
        if (!token.isNative) {
          await addERC20(tokenAddress, unlockAddress, amount)
        } else {
          await addSomeETH(unlockAddress, amount)
        }
        const balance = await getBalance(unlockAddress, tokenAddress)
        expect(balance.toString()).to.equal(amount.toString())

        // burner has not UDT
        expect((await getBalance(swapBurner.address, UDT)).toString()).to.equal(
          '0'
        )

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
        const balanceBurner = await getBalance(swapBurner.address, tokenAddress)
        expect(balanceBurner.toString()).to.equal(amount.toString())
      })

      it('burns token entire balance', async () => {
        const { swapCalldata, value, swapRouter } = await getUDTSwapRoute({
          amountIn: amount,
          tokenIn: token,
          recipient: swapBurner.address,
        })
        const balanceBurnerBefore = await getBalance(
          swapBurner.address,
          tokenAddress
        )
        const udtBalanceBurnerBefore = await getBalance(swapBurner.address, UDT)

        await swapBurner.swapAndBurn(
          tokenAddress,
          swapRouter,
          amount,
          swapCalldata,
          { value }
        )
        const balanceBurner = await getBalance(swapBurner.address, tokenAddress)
        expect(balanceBurnerBefore.minus(balanceBurner).toString()).to.equal(
          '0'
        )
        const udtBalanceBurner = await getBalance(swapBurner.address, UDT)
        expect(udtBalanceBurner.minus(udtBalanceBurnerBefore).get(0)).to.equal(
          true
        )
      })
    })
  })
})
