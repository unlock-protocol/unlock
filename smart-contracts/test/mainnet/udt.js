const { ethers } = require('hardhat')
const { reverts } = require('truffle-assertions')
const { getProxyAddress } = require('../../helpers/proxy')

const { resetState, impersonate } = require('../helpers/mainnet')

const { errorMessages } = require('../helpers/constants')

const { VM_ERROR_REVERT_WITH_REASON } = errorMessages

contract('UnlockDiscountToken on mainnet', async () => {
  let udt
  const chainId = 1 // mainnet
  const unlockAddress = getProxyAddress(chainId, 'Unlock')

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
    const amount = ethers.utils.hexStripZeros(ethers.utils.parseEther('1000'))

    it('minters can not be added anymore', async () => {
      const [, minter] = await ethers.getSigners()
      await reverts(
        udt.addMinter(minter.address),
        `${VM_ERROR_REVERT_WITH_REASON} 'MinterRole: caller does not have the Minter role'`
      )
    })
    it('random accounts can not mint', async () => {
      const [, , lambda, recipient] = await ethers.getSigners()
      await reverts(
        udt.connect(lambda).mint(recipient.address, amount),
        `${VM_ERROR_REVERT_WITH_REASON} 'MinterRole: caller does not have the Minter role'`
      )
    })
    describe('the Unlock contract', () => {
      it('is declared as minter', async () => {
        assert.equal(await udt.isMinter(unlockAddress), true)
      })
      it('can mint', async () => {
        const [, , , recipient] = await ethers.getSigners()

        await impersonate(unlockAddress)
        const unlock = await ethers.getSigner(unlockAddress)
        const tx = await udt.connect(unlock).mint(recipient.address, amount)

        const { events } = await tx.wait()
        const { args } = events.find((v) => v.event === 'Transfer')

        assert.equal(args.from, ethers.constants.AddressZero)
        assert.equal(args.to, recipient.address)
        assert.equal(args.value.eq(amount), true)
      })
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
