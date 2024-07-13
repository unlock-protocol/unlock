const { assert } = require('chai')
const { ethers, upgrades } = require('hardhat')
const { reverts, ADDRESS_ZERO } = require('../helpers')

describe('UPToken / mint', () => {
  let owner
  let UP, up, swap
  before(async () => {
    ;[owner] = await ethers.getSigners()
    UP = await ethers.getContractFactory('UPToken')
    up = await upgrades.deployProxy(UP, [await owner.getAddress()])

    const UPSwap = await ethers.getContractFactory('UPSwap')
    swap = await upgrades.deployProxy(UPSwap, [
      ADDRESS_ZERO,
      await up.getAddress(),
      await owner.getAddress(),
    ])
  })
  describe('default', () => {
    it('nothing is mined before being explicitely called', async () => {
      assert.equal(await up.totalSupply(), 0n)
    })
  })

  describe('mint', () => {
    it('can be called only by owner', async () => {
      const [, attacker] = await ethers.getSigners()
      await reverts(
        up.connect(attacker).mint(await attacker.getAddress()),
        `OwnableUnauthorizedAccount("${await attacker.getAddress()}")`
      )
    })
    it('mint the entire supply', async () => {
      await up.mint(await swap.getAddress())
      const expectedSupply = (await up.TOTAL_SUPPLY()) * BigInt(10 ** 18)
      assert.equal(expectedSupply, await up.balanceOf(await swap.getAddress()))
      assert.equal(await up.totalSupply(), expectedSupply)
    })
    it('cannot mint twice', async () => {
      await up.mint(await swap.getAddress())
      assert.equal(
        (await up.TOTAL_SUPPLY()) * BigInt(10 ** 18),
        await up.balanceOf(await swap.getAddress())
      )
      // call again
      await up.mint(await swap.getAddress())
      assert.equal(
        (await up.TOTAL_SUPPLY()) * BigInt(10 ** 18),
        await up.balanceOf(await swap.getAddress())
      )
    })
  })
})
