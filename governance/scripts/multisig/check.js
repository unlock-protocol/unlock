const { getMultiSigInfo, logError } = require('../../helpers/multisig')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')

async function main({ chainId, safeAddress }) {
  let errors
  const { name, multisig, id } = await getNetwork(chainId)
  if (!chainId) {
    chainId = id
  }
  if (!safeAddress) {
    safeAddress = multisig
  }

  try {
    errors = await getMultiSigInfo(chainId, safeAddress)
  } catch (error) {
    errors = [`Couldn't fetch multisig info: ${error.message}`]
  }
  errors.forEach((error) => logError(name, chainId, multisig, error))
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
