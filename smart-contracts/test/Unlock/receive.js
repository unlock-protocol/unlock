const { assert } = require('chai')
const { ethers } = require('hardhat')
const { deployContracts, reverts, getBalance } = require('../helpers')

const oneEth = ethers.utils.parseEther('1')

describe('Unlock / receive', async () => {
  let unlock, signer

  before(async () => {
    ;[signer] = await ethers.getSigners()
    ;({ unlock } = await deployContracts())
  })

  describe('Unlock contract receiving native tokens', () => {
    it('works correctly', async () => {
      const balanceBefore = await getBalance(unlock.address)
      await signer.sendTransaction({
        to: unlock.address,
        value: oneEth,
      })
      assert.equal(
        balanceBefore.add(oneEth).toString(),
        (await getBalance(unlock.address)).toString()
      )
    })
    it('reverts with null value', async () => {
      await reverts(
        signer.sendTransaction({ to: unlock.address, value: 0 }),
        'Unlock__INVALID_AMOUNT'
      )
    })
  })
})
