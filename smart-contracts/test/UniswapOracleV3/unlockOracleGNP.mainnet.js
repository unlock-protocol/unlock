const { ethers } = require('hardhat')

const { expect } = require('chai')
const USDCabi = require('@unlock-protocol/hardhat-helpers/dist/ABIs/USDC.json')
const { mainnet } = require('@unlock-protocol/networks')
const { purchaseKeys, deployLock } = require('../helpers')

const {
  addSomeETH,
  impersonate,
  getUniswapTokens,
} = require('@unlock-protocol/hardhat-helpers')

// get unlock address on mainnet

const {
  unlockAddress,
  uniswapV3: { factoryAddress },
} = mainnet
const keyPriceUSDC = ethers.parseUnits('50', 6)
const FEE = 500
describe('Unlock GNP conversion', () => {
  let unlock
  let oracle
  let WETH, USDC

  before(async function () {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }

    // get token addresses
    ;({
      usdc: { address: USDC },
      weth: { address: WETH },
    } = await getUniswapTokens(1))

    const [deployer] = await ethers.getSigners()
    await addSomeETH(await deployer.getAddress())
    unlock = await ethers.getContractAt('Unlock', unlockAddress)
    const UnlockUniswapOracle =
      await ethers.getContractFactory('UniswapOracleV3')
    oracle = await UnlockUniswapOracle.deploy(factoryAddress, FEE)

    //impersonate unlock multisig
    const unlockOwner = await unlock.owner()
    await impersonate(unlockOwner)
    const unlockSigner = await ethers.getSigner(unlockOwner)
    unlock = unlock.connect(unlockSigner)

    // add oracle support for USDC
    await unlock
      .connect(unlockSigner)
      .setOracle(USDC, await oracle.getAddress())
  })

  it('weth is set correctly already', async () => {
    expect(await unlock.weth()).to.equals(WETH)
  })

  it('sets oracle address correctly', async () => {
    expect(await unlock.uniswapOracles[USDC]).to.equals(oracle.adress)
  })

  describe('USDC conversion in GNP', () => {
    let lock
    before(async () => {
      // reset GNP to zero
      await unlock.resetTrackedValue(0, 0)
      expect(await unlock.grossNetworkProduct()).to.equals(0)

      // create a USDC lock
      lock = await deployLock({
        unlock,
        keyPrice: keyPriceUSDC,
        tokenAddress: USDC,
      })
    })
    it('pricing is set correctly', async () => {
      // make sure price is correct
      expect(await lock.tokenAddress()).to.equals(USDC)
      expect(await lock.keyPrice()).to.equals(keyPriceUSDC)
    })
    it('updates GNP correctly a value correctly ', async () => {
      const NUMBER_OF_KEYS = 5
      const totalPrice = keyPriceUSDC * NUMBER_OF_KEYS

      const usdc = await ethers.getContractAt(USDCabi, USDC)

      // mint some usdc
      const masterMinter = await usdc.masterMinter()
      await impersonate(masterMinter)
      const minter = await ethers.getSigner(masterMinter)
      const [signer] = await ethers.getSigners()
      await usdc
        .connect(minter)
        .configureMinter(await signer.getAddress(), totalPrice)
      await usdc.mint(await signer.getAddress(), totalPrice)

      // approve purchase
      await usdc.approve(await lock.getAddress(), totalPrice)

      // consult our oracle independently for 1 USDC
      const rate = await oracle.consult(USDC, ethers.parseUnits('1', 6), WETH)

      // purchase some keys
      await purchaseKeys(lock, NUMBER_OF_KEYS, keyPriceUSDC, true)

      // check GNP
      const GNP = await unlock.grossNetworkProduct()
      expect(GNP).to.not.equals('0')
      // 5 keys at 50 USDC at oracle rate
      expect(GNP / 1000).to.equals((rate * 250) / 1000)

      // show value in ETH to approx
      console.log(`250 USDC =~ ${ethers.formatUnits(GNP)} ETH`)
    })
  })
})
