const { ethers } = require('hardhat')
const { SafeFactory } = require('@gnosis.pm/safe-core-sdk')
const EthersAdapter = require('@gnosis.pm/safe-ethers-lib').default
const getOwners = require('./owners')

async function main({ owners, threshold = 4 }) {
  if (owners && owners.length % 2 == 0) {
    throw new Error('GNOSIS SAFE SETUP > Number of owners should be odd.')
  }
  if (owners && owners.length < threshold) {
    throw new Error(
      'GNOSIS SAFE SETUP > Threshold is greater than number of owners.'
    )
  }

  // get mainnet owners if needed
  if (!owners) {
    const mainnetOwners = await getOwners({ chainId: 1 })
    owners = mainnetOwners
  }

  const [deployer] = await ethers.getSigners()
  const ethAdapter = new EthersAdapter({ ethers, signer: deployer })

  const safeFactory = await SafeFactory.create({ ethAdapter })

  const safeAccountConfig = {
    owners,
    threshold,
  }

  console.log('GNOSIS SAFE SETUP > Deploying new safe...')

  const safe = await safeFactory.deploySafe({ safeAccountConfig })
  const safeAddress = safe.getAddress()

  console.log('GNOSIS SAFE SETUP > New safe deployed at: ', safeAddress)
  console.log('GNOSIS SAFE SETUP > Owners: ')
  owners.forEach((owner) => console.log(`${owner}`))

  return safeAddress
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
