const { ethers } = require('hardhat')
const { deployContracts, reverts, getBalanceEthers } = require('../helpers')

const oneEth = ethers.utils.parseEther('1')

contract('Unlock / receive', async () => {
  let unlock, signer

  before(async () => {
    ; [signer] = await ethers.getSigners()
    ; ({ unlockEthers: unlock } = await deployContracts())
  })

  describe('Unlock contract receiving native tokens', () => {

    it('works correctly', async () => {
      const balanceBefore = await getBalanceEthers(unlock.address)
      await signer.sendTransaction({
        to: unlock.address,
        value: oneEth
      })
      assert.equal(
        balanceBefore.add(oneEth).toString(),
        (await getBalanceEthers(unlock.address)).toString()
      )
    })
    it('reverts with null value', async () => {
      await reverts(
        signer.sendTransaction({ to: unlock.address, value: 0}),
        'Unlock__INVALID_AMOUNT'
      )
    })
  })
})