const { assert } = require('chai')
const { ethers, upgrades } = require('hardhat')

describe('UPToken / initialization', () => {
  let owner, preMinter
  let up
  before(async () => {
    ;[owner, preMinter] = await ethers.getSigners()

    const UP = await ethers.getContractFactory('UPToken')
    up = await upgrades.deployProxy(UP, [
      await owner.getAddress(),
      await preMinter.getAddress(),
    ])
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
        await up.balanceOf(await preMinter.getAddress())
      )
    })
  })
})
