const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')
const { mainnet } = require('@unlock-protocol/networks')

const UniswapOracle = require('../helpers/ABIs/UniswapOracle.json')
const USDCabi = require('../helpers/ABIs/USDC.json')

const {
  ADDRESS_ZERO,
  deployLock,
  deployERC20,
  USDC,
  WETH,
  UNISWAP_FACTORY_ADDRESS,
  impersonate,
  purchaseKey,
  purchaseKeys,
} = require('../helpers')

const { unlockAddress } = mainnet
console.log({ unlockAddress, USDC })

const keyPrice = ethers.utils.parseUnits('0.01', 'ether')

let unlock
let lock
let token
let oracle
let signer
let keyOwner

const decodeGNPEvent = (tx) => {
  // decode log manually (truffle issue)
  const debugLog = tx.receipt.rawLogs[1]
  const eventABI = [
    {
      indexed: false,
      internalType: 'uint256',
      name: 'grossNetworkProduct',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'valueInETH',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'address',
      name: 'tokenAddress',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'value',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'address',
      name: 'lockAddress',
      type: 'address',
    },
  ]

  const decoded = web3.eth.abi.decodeLog(
    eventABI,
    debugLog.data,
    debugLog.topics
  )

  const { grossNetworkProduct, valueInETH, tokenAddress, value, lockAddress } =
    decoded

  return {
    grossNetworkProduct,
    valueInETH,
    tokenAddress,
    value,
    lockAddress,
  }
}

contract('Unlock / uniswapValue', () => {
  before(async () => {
    if (!process.env.RUN_MAINNET_FORK) {
      // all suite will be skipped
      this.skip()
    }
    ;[signer, keyOwner] = await ethers.getSigners()
    unlock = await ethers.getContractAt('Unlock', unlockAddress)

    // deploy oracle
    const { abi, bytecode } = UniswapOracle
    const Oracle = await ethers.getContractFactory(abi, bytecode)
    oracle = await Oracle.deploy(UNISWAP_FACTORY_ADDRESS)
    await oracle.deployed()

    //impersonate unlock multisig
    const unlockOwner = await unlock.owner()
    await impersonate(unlockOwner)
    const unlockSigner = await ethers.getSigner(unlockOwner)
    unlock = unlock.connect(unlockSigner)
  })

  it('weth is set correctly already', async () => {
    expect(await unlock.weth()).to.equals(WETH)
  })

  it('sets oracle address correctly', async () => {
    expect(await unlock.uniswapOracles(USDC)).to.equals(oracle.adress)
  })

  describe('A supported token (USDC)', () => {
    let usdc
    const keyPriceUSDC = ethers.utils.parseUnits('50', 6)
    const totalPrice = keyPriceUSDC.mul(5)

    before(async () => {
      // add oracle support for USDC
      await unlock.setOracle(USDC, oracle.address)

      // create a USDC lock
      lock = await deployLock({
        unlock,
        tokenAddress: USDC,
        keyPrice: keyPriceUSDC,
      })
      ;({ lock } = await unlock.createLock({
        unlockAddress,
        keyPrice: keyPriceUSDC,
        tokenAddress: USDC,
      }))

      usdc = await ethers.getContractAt(USDCabi, USDC)

      // mint some usdc
      const masterMinter = await usdc.masterMinter()
      await impersonate(masterMinter)
      const minter = await ethers.getSigner(masterMinter)
      await usdc.connect(minter).configureMinter(signer.address, totalPrice)
      await usdc.mint(signer.address, totalPrice)
    })

    it('pricing is set correctly', async () => {
      // make sure price is correct
      expect(await lock.tokenAddress()).to.equals(USDC)
      expect((await lock.keyPrice()).toString()).to.equals(
        keyPriceUSDC.toString()
      )
    })

    describe('Purchase key', () => {
      let gnpBefore
      let tx

      beforeEach(async () => {
        gnpBefore = new BigNumber(await unlock.grossNetworkProduct())
        // approve purchase
        await usdc.approve(lock.address, totalPrice)
        tx = await purchaseKeys(lock, 5, true)
      })

      it('GDP went up by the expected ETH value', async () => {
        // consult our oracle independently for 1 USDC
        const rate = await oracle.consult(
          USDC,
          ethers.utils.parseUnits('1', 6),
          WETH
        )

        const GNP = await unlock.grossNetworkProduct()
        expect(GNP.toString()).to.not.equals(gnpBefore.toString())

        // 5 keys at 50 USDC at oracle rate
        const priceConverted = rate.mul(250).div(1000).toString()
        expect(GNP.div(1000).toString()).to.equals(
          gnpBefore.add(priceConverted)
        )

        // show approx value in ETH for reference
        console.log(`250 USDC =~ ${ethers.utils.formatUnits(GNP)} ETH`)
      })

      it('a GDP tracking event has been emitted', async () => {
        const {
          grossNetworkProduct,
          valueInETH,
          tokenAddress,
          value,
          lockAddress,
        } = decodeGNPEvent(tx)

        const gdp = new BigNumber(await unlock.grossNetworkProduct())

        assert.equal(gdp.toString(), grossNetworkProduct)
        assert.equal(
          '0.00006',
          new BigNumber(valueInETH).shiftedBy(-18).toFixed(5)
        )
        assert.equal(token.address, tokenAddress)
        assert.equal(keyPrice, value)
        assert.equal(lockAddress, lock.address)
      })
    })
  })

  describe('A unsupported token', () => {
    beforeEach(async () => {
      token = await deployERC20()
      // Mint some tokens for purchase
      await token.mint(
        signer.address,
        ethers.utils.parseUnits('10000', 'ether')
      )
      lock = await deployLock({ unlock, tokenAddress: token.address })
    })

    describe('Purchase key', () => {
      let gdpBefore
      let tx

      beforeEach(async () => {
        gdpBefore = new BigNumber(await unlock.grossNetworkProduct())
        await token.approve(lock.address, keyPrice)
        tx = await purchaseKey(lock, keyOwner.address, true)
      })

      it('GDP did not change', async () => {
        const gdp = new BigNumber(await unlock.grossNetworkProduct())
        assert.equal(gdp.toFixed(), gdpBefore.toFixed())
      })

      it('a GDP tracking event has been emitted', async () => {
        const {
          grossNetworkProduct,
          valueInETH,
          tokenAddress,
          value,
          lockAddress,
        } = decodeGNPEvent(tx)

        const gdp = new BigNumber(await unlock.grossNetworkProduct())

        assert.equal(gdp.toString(), grossNetworkProduct)
        assert.equal(0, valueInETH)
        assert.equal(token.address, tokenAddress)
        assert.equal(keyPrice, value)
        assert.equal(lockAddress, lock.address)
      })
    })
  })

  describe('ETH', () => {
    beforeEach(async () => {
      lock = await deployLock({ unlock })
    })

    describe('Purchase key', () => {
      let gdpBefore
      let tx

      beforeEach(async () => {
        gdpBefore = new BigNumber(await unlock.grossNetworkProduct())

        tx = await purchaseKey(lock, keyOwner.address)
      })

      it('GDP went up by the keyPrice', async () => {
        const gdp = new BigNumber(await unlock.grossNetworkProduct())
        assert.equal(
          gdp.toFixed(),
          gdpBefore.plus(keyPrice.toString()).toFixed()
        )
      })

      it('a GDP tracking event has been emitted', async () => {
        const {
          grossNetworkProduct,
          valueInETH,
          tokenAddress,
          value,
          lockAddress,
        } = decodeGNPEvent(tx)

        const gdp = new BigNumber(await unlock.grossNetworkProduct())

        assert.equal(gdp.toString(), grossNetworkProduct)
        assert.equal(keyPrice, valueInETH)
        assert.equal(ADDRESS_ZERO, tokenAddress)
        assert.equal(keyPrice, value)
        assert.equal(lockAddress, lock.address)
      })
    })
  })
})
