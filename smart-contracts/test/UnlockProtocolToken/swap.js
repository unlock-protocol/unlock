const { assert } = require('chai')
const { ethers, upgrades } = require('hardhat')
const { deployContracts } = require('../helpers')

describe('UPSwap / swap UDT for UP', () => {
  let owner, preMinter
  let up, udt, swap

  before(async () => {
    ;[owner, preMinter] = await ethers.getSigners()
    ;({ udt } = await deployContracts())

    const UP = await ethers.getContractFactory('UnlockProtocolToken')
    up = await upgrades.deployProxy(UP, [
      await owner.getAddress(),
      await preMinter.getAddress(),
    ])

    const UPSwap = await ethers.getContractFactory('UPSwap')
    swap = await upgrades.deployProxy(UPSwap, [
      await up.getAddress(),
      await udt.getAddress(),
      await owner.getAddress(),
    ])
  })

  describe('settings', () => {
    it('udt is properly set', async () => {
      assert.equal(await swap.up(), await up.getAddress())
    })
    it('up is properly set', async () => {
      assert.equal(await swap.udt(), await udt.getAddress())
    })
  })
  describe('ownership', () => {
    it('is properly set', async () => {
      assert.equal(await owner.getAddress(), await swap.owner())
    })
  })
})
