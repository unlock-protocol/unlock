const { getProvider, getSafeAddress } = require('./_helpers')

async function main({ chainId }) {
  const { provider } = await getProvider(chainId)
  const safeAddress = await getSafeAddress(provider, chainId)
  return safeAddress
}

module.exports = main
