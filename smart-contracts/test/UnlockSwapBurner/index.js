const { ethers } = require('hardhat')
const { expect } = require('chai')
const { networks } = require('@unlock-protocol/networks')
const {
  getBalance,
  PERMIT2_ADDRESS,
  CHAIN_ID,
  UDT,
  addSomeETH,
  USDC,
  addERC20,
  impersonate,
  // reverts,
} = require('../helpers')
const uniswapRouterAddresses = require('../../scripts/uniswap/routerAddresses.json')

describe(`swapAndBurn`, function () {
  let swapBurner, routerAddress, usdc, unlockAddress
  before(async function () {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }

    // fund signer
    const [signer] = await ethers.getSigners()
    await addSomeETH(signer.address)

    const { UniversalRouter } = uniswapRouterAddresses[CHAIN_ID]
    routerAddress = UniversalRouter

    const { chainId } = await ethers.provider.getNetwork()

    ;({ unlockAddress } = networks[chainId])

    // deploy swapper
    const UnlockSwapBurner = await ethers.getContractFactory('UnlockSwapBurner')
    swapBurner = await UnlockSwapBurner.deploy(
      unlockAddress,
      UDT,
      PERMIT2_ADDRESS,
      routerAddress
    )

    usdc = await ethers.getContractAt('IUSDC', USDC)
  })

  describe('constructor', () => {
    it('unlock is set properly', async () => {
      expect(await swapBurner.unlockAddress()).to.equal(unlockAddress)
    })
    it('udt is set properly', async () => {
      expect(await swapBurner.udtAddress()).to.equal(UDT)
    })
    it('uniswapRouter is set properly', async () => {
      expect(await swapBurner.swapRouter()).to.equal(routerAddress)
    })
    it('permit2 is set properly', async () => {
      expect(await swapBurner.permit2()).to.equal(PERMIT2_ADDRESS)
    })
  })

  describe('swap and burn process', () => {
    let balanceBefore
    before(async () => {
      await addERC20(
        usdc.address,
        unlockAddress,
        ethers.utils.parseUnits('500', await usdc.decimals())
      )
      balanceBefore = await getBalance(unlockAddress, usdc.address)
    })

    it(`Unlock has some USDC`, async () => {
      expect(balanceBefore.gt(0)).to.equal(true)
    })

    it('burns USDC entire balance', async () => {
      const unlockSigner = await impersonate(unlockAddress)
      await usdc
        .connect(unlockSigner)
        .approve(swapBurner.address, balanceBefore.toString())

      await swapBurner.swapAndBurn(usdc.address, 0)
      expect(balanceBefore.eq(0)).to.equal(false)
    })
  })
})
