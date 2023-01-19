const { ethers } = require('hardhat')
const { mainnet } = require('@unlock-protocol/networks')
const { expect } = require('chai')

const ShibaInuAbi = require('../helpers/ABIs/erc20.json')
const USDCabi = require('../helpers/ABIs/USDC.json')

const {
  ADDRESS_ZERO,
  deployLock,
  deployERC20,
  SHIBA_INU,
  WETH,
  USDC,
  impersonate,
  purchaseKey,
  purchaseKeys,
  deployUniswapV3Oracle,
} = require('../helpers')

const { unlockAddress } = mainnet
const keyPrice = ethers.utils.parseUnits('0.01', 'ether')
const totalPrice = keyPrice.mul(5)

// USDC (only 6 decimals)
const keyPriceUSDC = ethers.utils.parseUnits('50', 6)
const totalPriceUSDC = keyPriceUSDC.mul(5)

contract('Unlock / uniswapValue', () => {
  let lock
  let unlock
  let token
  let oracle
  let oracleAddress
  let signer
  let keyOwner

  before(async function () {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }
    ;[signer, keyOwner] = await ethers.getSigners()
    unlock = await ethers.getContractAt('Unlock', unlockAddress)

    // deploy oracle
    oracle = await deployUniswapV3Oracle()
    oracleAddress = oracle.address

    //impersonate unlock multisig
    const unlockOwner = await unlock.owner()
    await impersonate(unlockOwner)
    const unlockSigner = await ethers.getSigner(unlockOwner)
    unlock = unlock.connect(unlockSigner)
  })

  it('weth is set correctly already', async () => {
    expect(await unlock.weth()).to.equals(WETH)
  })

  it('oracle for USDC was already set to the v2 oracle address', async () => {
    expect(oracleAddress).to.not.equals(await unlock.uniswapOracles(USDC))
  })

  describe('A supported token (USDC)', () => {
    let usdc
    before(async () => {
      // mint some usdc
      usdc = await ethers.getContractAt(USDCabi, USDC)
      const masterMinter = await usdc.masterMinter()
      await impersonate(masterMinter)
      const minter = await ethers.getSigner(masterMinter)
      await usdc.connect(minter).configureMinter(signer.address, totalPriceUSDC)
      await usdc.mint(signer.address, totalPriceUSDC)

      // add oracle support for USDC
      await unlock.setOracle(USDC, oracle.address)

      // create a USDC lock
      lock = await deployLock({
        unlock,
        tokenAddress: USDC,
        keyPrice: keyPriceUSDC,
      })
    })

    it('sets oracle address correctly', async () => {
      expect(oracleAddress).to.equals(await unlock.uniswapOracles(USDC))
    })

    it('pricing is set correctly', async () => {
      // make sure price is correct
      expect(await lock.tokenAddress()).to.equals(USDC)
      expect((await lock.keyPrice()).toString()).to.equals(
        keyPriceUSDC.toString()
      )
    })

    describe('Purchase keys', () => {
      let gnpBefore
      let blockNumber
      let rate

      before(async () => {
        gnpBefore = await unlock.grossNetworkProduct()
        // approve purchase
        await usdc.connect(signer).approve(lock.address, totalPriceUSDC)
        ;({ blockNumber } = await purchaseKeys(lock, 5, true))

        // consult our oracle independently for 1 USDC
        rate = await oracle.consult(USDC, ethers.utils.parseUnits('1', 6), WETH)
      })

      it('GDP went up by the expected ETH value', async () => {
        const GNP = await unlock.grossNetworkProduct()
        expect(GNP.toString()).to.not.equals(gnpBefore.toString())

        // 5 keys at 50 USDC at oracle rate
        const priceConverted = rate.mul(250)
        expect(GNP.div(1000).toString()).to.equals(
          gnpBefore.add(priceConverted).div(1000).toString()
        )

        // show approx value in ETH for reference
        console.log(`250 USDC =~ ${ethers.utils.formatUnits(GNP)} ETH`)
      })

      it('a GDP tracking event has been emitted', async () => {
        const events = await unlock.queryFilter('GNPChanged', blockNumber)
        // 1 record per purchase
        assert.equal(events.length, 5)

        events.forEach(
          (
            {
              args: {
                grossNetworkProduct,
                _valueInETH,
                tokenAddress,
                value,
                lockAddress,
              },
            },
            i
          ) => {
            assert.equal(tokenAddress, USDC)
            assert.equal(lockAddress, lock.address)
            assert.equal(value.toString(), keyPriceUSDC.toString())
            // rate * 50 USDC per key
            assert.equal(
              _valueInETH.div(1000).toString(),
              rate.mul(50).div(1000).toString()
            )
            assert.equal(
              gnpBefore
                .add(rate.mul(50).mul(i + 1))
                .div(1000)
                .toString(),
              grossNetworkProduct.div(1000).toString()
            )
          }
        )
        const gnp = await unlock.grossNetworkProduct()
        expect(gnp.toString()).to.equals(
          events[4].args.grossNetworkProduct.toString()
        )
      })
    })
  })

  describe('A supported token (SHIBA_INU)', () => {
    let shibaInu
    before(async () => {
      // mint some usdc
      shibaInu = await ethers.getContractAt(ShibaInuAbi, SHIBA_INU)

      // transfer from the contract itself
      await impersonate(SHIBA_INU)
      const shibaInuOwner = await ethers.getSigner(SHIBA_INU)
      await shibaInu.connect(shibaInuOwner).transfer(signer.address, totalPrice)

      // add oracle support for SHIBA_INU
      await unlock.setOracle(SHIBA_INU, oracle.address)

      // create a SHIBA_INU lock
      lock = await deployLock({
        unlock,
        tokenAddress: SHIBA_INU,
        keyPrice,
      })
    })

    it('sets oracle address correctly', async () => {
      expect(oracleAddress).to.equals(await unlock.uniswapOracles(SHIBA_INU))
    })

    it('pricing is set correctly', async () => {
      // make sure price is correct
      expect(await lock.tokenAddress()).to.equals(SHIBA_INU)
      expect((await lock.keyPrice()).toString()).to.equals(keyPrice.toString())
    })

    describe('Purchase keys', () => {
      let gnpBefore
      let blockNumber
      let rate

      before(async () => {
        gnpBefore = await unlock.grossNetworkProduct()
        // approve purchase
        await shibaInu.connect(signer).approve(lock.address, totalPrice)
        ;({ blockNumber } = await purchaseKeys(lock, 5, true))

        // consult our oracle independently for 1 SHIBA_INU
        rate = await oracle.consult(
          SHIBA_INU,
          ethers.utils.parseUnits('1', 6),
          WETH
        )
      })

      it('GDP went up by the expected ETH value', async () => {
        const GNP = await unlock.grossNetworkProduct()
        expect(GNP.toString()).to.not.equals(gnpBefore.toString())

        // 5 keys at 50 SHIBA_INU at oracle rate
        const priceConverted = rate.mul(250)
        const diff = GNP.sub(gnpBefore.add(priceConverted))
        expect(diff.toNumber()).to.be.lte(1000) // price variation

        // show approx value in ETH for reference
        console.log(`250 SHIBA_INU =~ ${ethers.utils.formatUnits(GNP)} ETH`)
      })

      it('a GDP tracking event has been emitted', async () => {
        const events = await unlock.queryFilter('GNPChanged', blockNumber)
        // 1 record per purchase
        assert.equal(events.length, 5)

        events.forEach(
          (
            {
              args: {
                grossNetworkProduct,
                _valueInETH,
                tokenAddress,
                value,
                lockAddress,
              },
            },
            i
          ) => {
            assert.equal(tokenAddress, SHIBA_INU)
            assert.equal(lockAddress, lock.address)
            assert.equal(value.toString(), keyPrice.toString())
            // rate * 0.01 SHIBA_INU per key
            console.log(_valueInETH)
            assert.equal(
              _valueInETH.toString(),
              rate.mul(0.01).div(1000).toString()
            )
            assert.equal(
              gnpBefore
                .add(rate.mul(0.01).mul(i + 1))
                .div(1000)
                .toString(),
              grossNetworkProduct.div(1000).toString()
            )
          }
        )
        const gnp = await unlock.grossNetworkProduct()
        expect(gnp.toString()).to.equals(
          events[4].args.grossNetworkProduct.toString()
        )
      })
    })
  })

  describe('A unsupported token', () => {
    beforeEach(async () => {
      token = await deployERC20(signer, true)
      // Mint some tokens for purchase
      await token.mint(signer.address, keyPrice)
      lock = await deployLock({ unlock, tokenAddress: token.address, keyPrice })
    })

    describe('Purchase key', () => {
      let gdpBefore
      let blockNumber

      beforeEach(async () => {
        gdpBefore = await unlock.grossNetworkProduct()
        await token.connect(signer).approve(lock.address, keyPrice)
        ;({ blockNumber } = await purchaseKey(lock, signer.address, true))
      })

      it('GDP did not change', async () => {
        const gdp = await unlock.grossNetworkProduct()
        assert.equal(gdp.toString(), gdpBefore.toString())
      })

      it('a GDP tracking event has been emitted', async () => {
        const events = await unlock.queryFilter('*', blockNumber)
        assert.equal(events.length, 1)

        const { args } = events.find(({ event }) => event === 'GNPChanged')
        const {
          grossNetworkProduct,
          _valueInETH,
          tokenAddress,
          value,
          lockAddress,
        } = args

        const gdp = await unlock.grossNetworkProduct()

        assert.equal(gdp.toString(), grossNetworkProduct.toString())
        assert.equal(0, _valueInETH.toNumber())
        assert.equal(token.address, tokenAddress)
        assert.equal(keyPrice.toString(), value.toString())
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
      let blockNumber

      beforeEach(async () => {
        gdpBefore = await unlock.grossNetworkProduct()
        ;({ blockNumber } = await purchaseKey(lock, keyOwner.address))
      })

      it('GDP went up by the keyPrice', async () => {
        const gdp = await unlock.grossNetworkProduct()
        assert.equal(gdp.toString(), gdpBefore.add(keyPrice).toString())
      })

      it('a GDP tracking event has been emitted', async () => {
        const events = await unlock.queryFilter('*', blockNumber)
        assert.equal(events.length, 1)

        const { args } = events.find(({ event }) => event === 'GNPChanged')
        const {
          grossNetworkProduct,
          _valueInETH,
          tokenAddress,
          value,
          lockAddress,
        } = args

        const gdp = await unlock.grossNetworkProduct()

        assert.equal(lockAddress, lock.address)
        assert.equal(ADDRESS_ZERO, tokenAddress)
        assert.equal(gdp.toString(), grossNetworkProduct.toString())
        assert.equal(keyPrice.toString(), _valueInETH.toString())
        assert.equal(keyPrice.toString(), value.toString())
      })
    })
  })
})
