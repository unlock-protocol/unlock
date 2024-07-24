const assert = require('assert')
const { ethers } = require('hardhat')
const { deployContracts, reverts, getBalance } = require('../helpers')

const oneEth = ethers.parseEther('1')

describe('Unlock / receive', () => {
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

describe('Unlock / networkBaseFee', () => {
  let unlock, signer

  before(async () => {
    ;[signer] = await ethers.getSigners()
    ;({ unlock } = await deployContracts())
  })

  it('returns the network base fee', async () => {
    const networkBaseFee = await unlock.networkBaseFee()
    assert.equal(networkBaseFee, 0)
  })
})

describe('Unlock / recordConsumedDiscount', () => {
  let unlock, signer

  before(async () => {
    ;[signer] = await ethers.getSigners()
    ;({ unlock } = await deployContracts())
  })

  it('revert if caller is not registered lock', async () => {
    await reverts(unlock.recordConsumedDiscount(0, 0), 'ONLY_LOCKS')
  })
})
