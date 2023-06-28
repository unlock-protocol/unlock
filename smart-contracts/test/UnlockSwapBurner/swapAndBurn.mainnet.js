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
  // reverts,
} = require('../helpers')

// get uniswap-formatted tokens
const { native, usdc, dai, wBtc } = getUniswapTokens(CHAIN_ID)
const scenarios = [native, usdc, dai, wBtc]

describe(`swapAndBurn`, function () {
  let swapBurner, unlockAddress, routers
  before(async function () {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }

    // fund signer
    const [signer] = await ethers.getSigners()
    await addSomeETH(signer.address)

    const routers = getUniswapRouters()
    const { chainId } = await ethers.provider.getNetwork()

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

        // Unlock has some token
        if (!token.isNative) {
          await addERC20(token.address, unlockAddress, amount)
        } else {
          await addSomeETH(unlockAddress, amount)
        }
        const balance = await getBalance(unlockAddress, token.address)
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
            token.address,
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
          token.address
        )
        expect(balanceBurner.toString()).to.equal(amount.toString())
      })

      it('burns token entire balance', async () => {
        const { swapCalldata, value, swapRouter } = await getUDTSwapRoute({
          amountIn: amount,
          tokenIn: token,
          recipient: swapBurner.address,
        })

        await swapBurner.swapAndBurn(
          token.address,
          swapRouter,
          amount,
          swapCalldata,
          { value }
        )
        const balanceBurner = await getBalance(
          swapBurner.address,
          token.address
        )
        expect(balanceBurner.toString()).to.equal('0')
        const udtBalanceBurner = await getBalance(swapBurner.address, UDT)
        expect(udtBalanceBurner.gt(0)).to.equal(true)
        console.log(udtBalanceBurner)
      })
    })
  })
})
