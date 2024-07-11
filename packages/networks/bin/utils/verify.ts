const {
  builtinChains,
} = require('@nomicfoundation/hardhat-verify/internal/chain-config')
const { etherscan } = require('@unlock-protocol/hardhat-helpers')

// init sentry
// require('../../helpers/logger')
// const Sentry = require('@sentry/node')

export function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function isSuccessStatusCode(statusCode) {
  return statusCode >= 200 && statusCode <= 299
}

export const isVerified = async ({
  contractAddress,
  chainId,
}: {
  contractAddress: string
  chainId: string | number | bigint
}) => {
  // get etherscan API URLs and keys
  const { apiKey: apiKeys, customChains } = etherscan
  const chains = [...builtinChains, ...customChains]

  const { urls, network } = chains.find((chain) => chain.chainId == chainId)
  const apiKey = apiKeys[network]

  // parse URL
  const parameters = new URLSearchParams({
    action: 'getabi',
    address: contractAddress,
    apikey: apiKey,
    module: 'contract',
  })
  const url = new URL(urls.apiURL)
  url.search = parameters.toString()

  // fetch contract status
  try {
    const response = await fetch(url, { method: 'GET' })
    const json = await response.json()
    if (!isSuccessStatusCode(response.status)) {
      throw new Error(
        `Failed verification
  (${response.status}) ${url.toString()},
  ${JSON.stringify(json)}`
      )
    }

    const { status, result, message } = json
    const isVerified = status === '1'
    return { isVerified, message, result, status }
  } catch (e) {
    console.error(`Failed verification API call`, e)
    // Sentry.captureException(e)
  }
}
