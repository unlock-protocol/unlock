const { getSafeAddress } = require('../../helpers/multisig')

async function main({ chainId }) {
  const safeAddress = await getSafeAddress(chainId)
  return safeAddress
}

module.exports = main
