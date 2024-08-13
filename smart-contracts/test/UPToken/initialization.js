const { assert } = require('chai')
const { ethers, upgrades, network } = require('hardhat')
const { reverts } = require('../helpers')
const { getImplementationAddress } = require('@openzeppelin/upgrades-core')

describe('UPToken / initialization', () => {
  let owner
  let UP, up, swap
  before(async () => {
    ;[owner] = await ethers.getSigners()
    UP = await ethers.getContractFactory('UPToken')
    up = await upgrades.deployProxy(UP, [await owner.getAddress()])
  })
  describe('reverts', () => {
    it('initializer is called again', async () => {
      const [, attacker] = await ethers.getSigners()
      await reverts(
        up.initialize(await attacker.getAddress()),
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
        impl.initialize(await attacker.getAddress()),
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
})
