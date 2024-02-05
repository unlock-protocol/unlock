const { ethers } = require('hardhat')
const {
  copyAndBuildContractsAtVersion,
  deployUpgradeableContract,
} = require('@unlock-protocol/hardhat-helpers')

async function main() {
  const [minter] = await ethers.getSigners()

  await copyAndBuildContractsAtVersion(__dirname, [
    {
      contractName: 'UnlockDiscountToken',
      contractFullName: 'UnlockDiscountTokenV3',
      version: 3,
    },
  ])

  const { hash, address: udtAddress } = await deployUpgradeableContract(
    'contracts/past-versions/UnlockDiscountTokenV3.sol:UnlockDiscountTokenV3',
    [minter.address],
    {
      initializer: 'initialize(address)',
    }
  )

  // eslint-disable-next-line no-console
  console.log(
    `UDT SETUP > UDT v3 (w proxy) deployed to: ${udtAddress} (tx: ${hash})`
  )

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
