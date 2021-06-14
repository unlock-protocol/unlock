const { ethers, upgrades } = require('hardhat')

it('test upgrade', async () => {
  const UnlockDiscountToken = await ethers.getContractFactory(
    'UnlockDiscountToken'
  )
  const UnlockDiscountTokenV2 = await ethers.getContractFactory(
    'UnlockDiscountTokenV2'
  )

  const [minter] = await ethers.getSigners()

  const instance = await upgrades
    .deployProxy(UnlockDiscountToken, [minter.address], {
      kind: 'transparent',
      initializer: 'initialize(address)',
    })
    .then((f) => f.deployed())

  await upgrades.upgradeProxy(instance.address, UnlockDiscountTokenV2, {})
})
