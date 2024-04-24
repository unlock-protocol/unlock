const { config } = require('hardhat')
const {
  builtinChains,
} = require('@nomicfoundation/hardhat-verify/internal/chain-config')

function isSuccessStatusCode(statusCode) {
  return statusCode >= 200 && statusCode <= 299
}

async function main({ contractAddress, chainId } = {}) {
  // get etherscan API URLs and keys
  const { apiKey: apiKeys, customChains } = config.etherscan
  const chains = [...builtinChains, ...customChains]

  const { urls, network } = chains.find((chain) => chain.chainId == chainId)
  const apiKey = apiKeys[network]

  // parse URL
  const parameters = new URLSearchParams({
    apikey: apiKey,
    module: 'contract',
    action: 'getabi',
    address: contractAddress,
  })
  const url = new URL(urls.apiURL)
  url.search = parameters.toString()

  // fetch contract status
  try {
    const response = await fetch(url, { method: 'GET' })
    const json = await response.json()
    if (!isSuccessStatusCode(response.status)) {
      throw new Error(
        `Failed verification`,
        url.toString(),
        response.statusCode,
        JSON.stringify(json)
      )
    }

    const { status, result, message } = json
    const isVerified = status === '1'
    return { isVerified, status, result, message }
  } catch (e) {
    console.log(`Failed verification API call`, e)
  }
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
