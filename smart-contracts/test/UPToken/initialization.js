const { assert } = require('chai')
const { ethers, upgrades, network } = require('hardhat')
const { reverts } = require('../helpers')
const { getImplementationAddress } = require('@openzeppelin/upgrades-core')

describe('UPToken / initialization', () => {
  let owner
  let UP, up, swap
  before(async () => {
    ;[owner] = await ethers.getSigners()

    const MockUPSwap = await ethers.getContractFactory('MockUPSwap')
    swap = await MockUPSwap.deploy()

    UP = await ethers.getContractFactory('UPToken')
    up = await upgrades.deployProxy(UP, [
      await owner.getAddress(),
      await swap.getAddress(),
    ])
  })
  describe('reverts', () => {
    it('preminter is not a swapper contract', async () => {
      const [, attacker] = await ethers.getSigners()
      await reverts(
        upgrades.deployProxy(UP, [
          await owner.getAddress(),
          await attacker.getAddress(),
        ]),
        'reverted with an unrecognized custom error'
      )
    })
    it('initializer is called again', async () => {
      const [, attacker] = await ethers.getSigners()
      await reverts(
        up.initialize(await attacker.getAddress(), await attacker.getAddress()),
        'InvalidInitialization'
      )
    })
    it('try to initialize implementation contract', async () => {
      const [, attacker] = await ethers.getSigners()
      const implAddress = await getImplementationAddress(
        network.provider,
        await up.getAddress()
      )
      const impl = await ethers.getContractAt('UPToken', implAddress)
      await reverts(
        impl.initialize(
          await attacker.getAddress(),
          await attacker.getAddress()
        ),
        'InvalidInitialization'
      )
    })
  })

  describe('settings', () => {
    it('name is properly set', async () => {
      assert.equal(await up.name(), 'UnlockProtocolToken')
    })
    it('ticker is properly set', async () => {
      assert.equal(await up.symbol(), 'UP')
    })
    it('decimal is properly set', async () => {
      assert.equal(await up.decimals(), 18)
    })
  })
  describe('ownership', () => {
    it('is properly set', async () => {
      assert.equal(await owner.getAddress(), await up.owner())
    })
  })
  describe('total supply is preminted correctly', () => {
    it('amount was transferred', async () => {
      assert.equal(
        (await up.TOTAL_SUPPLY()) * BigInt(10 ** 18),
        await up.balanceOf(await swap.getAddress())
      )
    })
  })
  describe('mock swap', () => {
    it('token is set correctly in swap', async () => {
      assert.equal(await swap.tokenAddress(), await up.getAddress())
    })
  })
})
