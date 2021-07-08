const { ethers, upgrades } = require('hardhat')

// helper function
const upgradeContract = async (contractAddress) => {
  const UnlockDiscountTokenV2 = await ethers.getContractFactory(
    'UnlockDiscountTokenV2'
  )
  const updated = await upgrades.upgradeProxy(
    contractAddress,
    UnlockDiscountTokenV2,
    {}
  )
  return updated
}

contract('UnlockDiscountToken upgrade', async () => {
  let unlockDiscountToken
  const mintAmount = 1000

  beforeEach(async () => {
    const UnlockDiscountToken = await ethers.getContractFactory(
      'UnlockDiscountToken'
    )

    const [minter] = await ethers.getSigners()

    unlockDiscountToken = await upgrades
      .deployProxy(UnlockDiscountToken, [minter.address], {
        kind: 'transparent',
        initializer: 'initialize(address)',
      })
      .then((f) => f.deployed())
  })

  describe('Supply', () => {
    it('Starting supply is 0', async () => {
      const totalSupply = await unlockDiscountToken.totalSupply()
      assert.equal(totalSupply.toNumber(), 0, 'starting supply must be 0')
    })

    it('Supply is preserved after upgrade', async () => {
      const [minter, recipient] = await ethers.getSigners()

      // mint some tokens
      await unlockDiscountToken.mint(recipient.address, mintAmount, {
        from: minter.address,
      })
      const totalSupply = await unlockDiscountToken.totalSupply()
      assert.equal(totalSupply.toNumber(), mintAmount)

      // upgrade
      const updated = await upgradeContract(unlockDiscountToken.address)
      
      const totalSupplyAfterUpdate = await updated.totalSupply()
      assert.equal(totalSupplyAfterUpdate.toNumber(), mintAmount)
    })
  })
})
