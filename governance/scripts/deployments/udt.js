const { ethers, upgrades, run } = require('hardhat')
const {
  copyAndBuildContractsAtVersion,
  isLocalhost,
} = require('@unlock-protocol/hardhat-helpers')

async function main() {
  const [minter] = await ethers.getSigners()

  await copyAndBuildContractsAtVersion(__dirname, [
    {
      contractName: 'UnlockDiscountToken',
      version: 3,
    },
  ])

  const UDT = await ethers.getContractFactory(
    'contracts/past-versions/UnlockDiscountTokenV3.sol:UnlockDiscountTokenV3'
  )

  const udt = await upgrades.deployProxy(UDT, [minter.address], {
    initializer: 'initialize(address)',
  })
  await udt.waitForDeployment()
  const { hash } = await udt.deploymentTransaction()
  const udtAddress = await udt.getAddress()

  // eslint-disable-next-line no-console
  console.log(
    `UDT SETUP > UDT v3 (w proxy) deployed to: ${udtAddress} (tx: ${hash})`
  )

  if (!(await isLocalhost())) {
    await run('verify:verify', { address: udtAddress })
  }

  return udtAddress
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
