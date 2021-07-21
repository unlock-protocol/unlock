const {
  Manifest,
  hashBytecodeWithoutMetadata,
} = require('@openzeppelin/upgrades-core')
const { ethers, run, network } = require('hardhat')

async function main() {
  if (!process.env.ETHERSCAN_API_KEY) {
    throw new Error('Missing ETHERSCAN_API_KEY. Please export to your env')
  }
  const manifestParser = await Manifest.forNetwork(network.provider)
  const manifest = await manifestParser.read()

  // contract factories
  const toVerify = ['Unlock', 'PublicLock', 'UnlockDiscountToken']

  await Promise.all(
    toVerify.map(async (factoryName) => {
      const factory = await ethers.getContractFactory(factoryName)

      // get implementation address
      const bytecodeHash = hashBytecodeWithoutMetadata(factory.bytecode)
      if (Object.keys(manifest.impls).includes(bytecodeHash)) {
        const { address } = manifest.impls[bytecodeHash]

        // Verify implementation on etherscan
        // eslint-disable-next-line no-console
        console.log(
          `Attempting to verify ${factoryName} implementation contract with etherscan`
        )
        try {
          await run('verify:verify', {
            address,
            constructorArguments: [],
          })
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(`Failed to verify contract: ${e}`)
        }
      } else {
        // eslint-disable-next-line no-console
        console.error(
          `Skipping contract: ${factoryName}. Implementation missing.`
        )
      }
    })
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
