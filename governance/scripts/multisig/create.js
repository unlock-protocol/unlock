const { ethers } = require('hardhat')
const { SafeFactory } = require('@safe-global/protocol-kit')
const { getExpectedSigners } = require('../../helpers/multisig')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')

async function main({ owners, threshold = 4 }) {
  if (owners && owners.length % 2 == 0) {
    throw new Error('SAFE SETUP > Number of owners should be odd.')
  }
  if (owners && owners.length < threshold) {
    throw new Error('SAFE SETUP > Threshold is greater than number of owners.')
  }

  // get signers if needed
  if (!owners) {
    owners = await getExpectedSigners()
  }

  if (!process.env.DEPLOYER_PRIVATE_KEY) {
    throw Error(
      `The DEPLOYER_PRIVATE_KEY needs to be exported to create a safe`
    )
  }
  const { provider } = await getNetwork()
  const safeFactory = await SafeFactory.init({
    signer: process.env.DEPLOYER_PRIVATE_KEY,
    provider,
  })

  const safeAccountConfig = {
    owners,
    threshold,
  }

  console.log('SAFE SETUP > Deploying new safe...')

  const safe = await safeFactory.deploySafe({ safeAccountConfig })
  const safeAddress = await safe.getAddress()

  console.log('SAFE SETUP > New safe deployed at: ', safeAddress)
  console.log('SAFE SETUP > Owners: ')
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
