const { getSafeAddress } = require('./_helpers')

async function main({ chainId }) {
  const safeAddress = await getSafeAddress(chainId)
  return safeAddress
}

module.exports = main
