const { ethers } = require('hardhat')
const { reverts } = require('truffle-assertions')
const { getProxyAddress } = require('../../helpers/proxy')

const { resetState } = require('../helpers/mainnet')

const { errorMessages } = require('../helpers/constants')

const { VM_ERROR_REVERT_WITH_REASON } = errorMessages

contract('UnlockDiscountToken on mainnet', async () => {
  let udt
  const chainId = 1 // mainnet

  beforeEach(async function setupMainnetForkTestEnv() {
    if (!process.env.RUN_MAINNET_FORK) {
      // all suite will be skipped
      this.skip()
    }

    // reset fork
    await resetState()

    // prepare proxy info
    const proxyAddress = getProxyAddress(chainId, 'UnlockDiscountTokenV2')
    // const proxyAdmin = getProxyAdminAddress({ network })
    // await impersonate(proxyAdmin)

    // mocha settings
    this.timeout(200000)

    const UnlockDiscountToken = await ethers.getContractFactory(
      'UnlockDiscountTokenV2'
    )
    const [, minter] = await ethers.getSigners()
    udt = await UnlockDiscountToken.attach(proxyAddress).connect(minter)
  })

  describe('ERC20 Details', () => {
    it('name is preserved', async () => {
      const name = await udt.name()
      assert.equal(name, 'Unlock Discount Token')
    })

    it('symbol is preserved', async () => {
      const symbol = await udt.symbol()
      assert.equal(symbol, 'UDT')
    })

    it('decimals are preserved', async () => {
      const decimals = await udt.decimals()
      assert.equal(decimals, 18)
    })
  })

  describe('Mint', () => {
    it('can not add minter anymore', async () => {
      const [, minter] = await ethers.getSigners()

      // mint tokens
      await reverts(
        udt.addMinter(minter.address),
        `${VM_ERROR_REVERT_WITH_REASON} 'MinterRole: caller does not have the Minter role'`
      )
    })
  })

  describe('Burn', () => {
    it('function does not exist', async () => {
      assert.equal(udt.burn, null)
      assert.equal(Object.keys(udt).includes('burn'), false)
      assert.equal(Object.keys(udt.functions).includes('burn'), false)
      assert.equal(Object.keys(udt.functions).includes('burn()'), false)
    })
  })

  describe('Supply', () => {
    it('is not 0', async () => {
      const totalSupply = await udt.totalSupply()
      assert.equal(
        totalSupply.gt(0),
        true,
        'starting supply must be different from 0'
      )
    })
  })
})
