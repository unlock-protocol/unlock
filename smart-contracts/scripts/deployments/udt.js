const { ethers, upgrades } = require('hardhat')
const { addDeployment } = require('../../helpers/deployments')

async function main() {
  const [, minter] = await ethers.getSigners()

  const UDT = await ethers.getContractFactory('UnlockDiscountTokenV3')
  const udt = await upgrades.deployProxy(UDT, [minter.address], {
    initializer: 'initialize(address)',
  })
  await udt.deployed()

  // eslint-disable-next-line no-console
  console.log(
    `UDT SETUP > UDT v3 (w proxy) deployed to: ${udt.address} (tx: ${udt.deployTransaction.hash})`
  )

  // save deployment info
  await addDeployment('UnlockDiscountTokenV3', udt, true)

  return udt.address
}

// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
