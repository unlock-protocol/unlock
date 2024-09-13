const assert = require('assert')
const { ethers } = require('hardhat')
const { deployContracts, reverts, getBalance } = require('../helpers')

const oneEth = ethers.parseEther('1')

describe('Unlock / receive', async () => {
  let unlock, signer

  before(async () => {
    ;[signer] = await ethers.getSigners()
    ;({ unlock } = await deployContracts())
  })

  describe('Unlock contract receiving native tokens', () => {
    it('works correctly', async () => {
      const balanceBefore = await getBalance(await unlock.getAddress())
      await signer.sendTransaction({
        to: await unlock.getAddress(),
        value: oneEth,
      })
      assert.equal(
        balanceBefore + oneEth,
        await getBalance(await unlock.getAddress())
      )
    })
    it('reverts with null value', async () => {
      await reverts(
        signer.sendTransaction({ to: await unlock.getAddress(), value: 0 }),
        'Unlock__INVALID_AMOUNT'
      )
    })
  })
})
