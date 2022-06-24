const { getProvider, getSafeAddress } = require('./_helpers')

async function main({ chainId }) {
  console.log(chainId)
  const { provider } = await getProvider(chainId)
  const safeAddress = await getSafeAddress(provider)
  return safeAddress
}

module.exports = main
