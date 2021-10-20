const { ethers } = require('hardhat')
const { reverts } = require('truffle-assertions')

const { errorMessages } = require('../helpers/constants')

const { VM_ERROR_REVERT_WITH_REASON } = errorMessages

contract('UnlockDiscountToken on mainnet', async () => {
  let udt

  before(() => {
    if (!process.env.RUN_MAINNET_FORK) {
      // all suite will be skipped
      this.skip()
    }
  })

  beforeEach(async () => {
    const UnlockDiscountToken = await ethers.getContractFactory(
      'UnlockDiscountTokenV2'
    )

    const [, minter] = await ethers.getSigners()
    udt = await UnlockDiscountToken.connect(minter)
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
      // reverts
      await udt.burn()
    })
  })

  describe('Supply', () => {
    it('is not 0', async () => {
      const totalSupply = await udt.totalSupply()
      assert.notEqual(
        totalSupply.toNumber(),
        0,
        'starting supply must be different from 0'
      )
    })
  })
})
