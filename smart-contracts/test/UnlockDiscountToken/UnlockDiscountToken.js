const { assert } = require('chai')
const { ethers } = require('hardhat')
const { reverts } = require('../helpers')

const deployContracts = require('../fixtures/deploy')

describe('udt', () => {
  let udt
  let minter, recipient, accounts

  before(async () => {
    ;[, minter, recipient, ...accounts] = await ethers.getSigners()
    ;({ udt } = await deployContracts())
  })

  describe('Supply', () => {
    it('Starting supply is 0', async () => {
      const totalSupply = await udt.totalSupply()
      assert(totalSupply.eq(0), 'starting supply must be 0')
    })

    describe('Minting tokens', () => {
      const mintAmount = 1000
      let balanceBefore
      let totalSupplyBefore

      before(async () => {
        balanceBefore = await udt.balanceOf(recipient.address)
        totalSupplyBefore = await udt.totalSupply()
        await udt.connect(minter).mint(recipient.address, mintAmount)
      })

      it('Balance went up', async () => {
        const balanceAfter = await udt.balanceOf(recipient.address)
        assert.equal(
          balanceAfter.toNumber(),
          balanceBefore.add(mintAmount).toNumber(),
          'Balance must increase by amount minted'
        )
      })

      it('Total supply went up', async () => {
        const totalSupplyAfter = await udt.totalSupply()
        assert.equal(
          totalSupplyAfter.toNumber(),
          totalSupplyBefore.add(mintAmount).toNumber(),
          'Total supply must increase by amount minted'
        )
      })
    })
  })

  describe('Transfer', () => {
    const mintAmount = 1000000

    before(async () => {
      for (let i = 0; i < 3; i++) {
        await udt.connect(minter).mint(accounts[i].address, mintAmount)
      }
    })

    describe('transfer', async () => {
      const transferAmount = 123
      let balanceBefore0
      let balanceBefore1

      before(async () => {
        balanceBefore0 = await udt.balanceOf(accounts[0].address)
        balanceBefore1 = await udt.balanceOf(accounts[1].address)
      })

      it('normal transfer', async () => {
        await udt
          .connect(accounts[0])
          .transfer(accounts[1].address, transferAmount)
        const balanceAfter0 = await udt.balanceOf(accounts[0].address)
        const balanceAfter1 = await udt.balanceOf(accounts[1].address)
        assert(
          balanceBefore0.sub(transferAmount).eq(balanceAfter0),
          'Sender balance must have gone down by amount sent'
        )
        assert(
          balanceBefore1.add(transferAmount).eq(balanceAfter1),
          'Recipient balance must have gone up by amount sent'
        )
      })
    })
  })

  describe('Minters', () => {
    let newMinter

    before(async () => {
      newMinter = accounts[5]
      await udt.connect(minter).addMinter(newMinter.address)
    })

    it('newMinter can mint', async () => {
      await udt.connect(newMinter).mint(accounts[0].address, 1)
    })

    describe('Renounce minter', () => {
      it('newMinter cannot mint anymore', async () => {
        await udt.connect(newMinter).renounceMinter()
        await reverts(
          udt.connect(newMinter).mint(accounts[0].address, 1),
          'MinterRole: caller does not have the Minter role'
        )
      })
    })
  })
})
