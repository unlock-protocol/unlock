const { ethers, upgrades } = require('hardhat')

async function main() {
  const [, minter] = await ethers.getSigners()

  const UDT = await ethers.getContractFactory('UnlockDiscountTokenV2')
  const udt = await upgrades.deployProxy(UDT, [minter.address], {
    initializer: 'initialize(address)',
  })
  await udt.deployed()

  // eslint-disable-next-line no-console
  console.log(
    `UDT SETUP > UDTv2 (w proxy) deployed to: ${udt.address} (tx: ${udt.deployTransaction.hash})`
  )

  return udt.address
}

// execute as standalone
if (require.main === module) {
  /* eslint-disable promise/prefer-await-to-then, no-console */
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
