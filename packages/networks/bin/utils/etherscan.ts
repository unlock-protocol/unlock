const {
  builtinChains,
} = require('@nomicfoundation/hardhat-verify/internal/chain-config')
const { etherscan } = require('@unlock-protocol/hardhat-helpers')

// init sentry
// require('../../helpers/logger')
// const Sentry = require('@sentry/node')

interface EtherscanParams {
  contractAddress: string
  chainId: string | number | bigint
}

// get etherscan API URLs and keys
const getCredentials = (chainId) => {
  const { apiKey: apiKeys, customChains } = etherscan
  const chains = [...builtinChains, ...customChains]

  const { urls, network } = chains.find((chain) => chain.chainId == chainId)
  const apiKey = apiKeys[network]

  return {
    apiKey,
    apiURL: urls.apiURL,
  }
}

async function fetchEtherscan({
  params,
  chainId,
}: {
  params: URLSearchParams
  chainId: string | number | bigint
}) {
  const { apiKey, apiURL } = getCredentials(chainId)
  params.append('apikey', apiKey)
  const url = new URL(apiURL)
  url.search = params.toString()
  // fetch contract status
  try {
    const response = await fetch(url, { method: 'GET' })
    const json = await response.json()
    if (!isSuccessStatusCode(response.status)) {
      throw new Error(
        `Failed to request etherscan
  (${response.status}) ${url.toString()},
  ${JSON.stringify(json)}`
      )
    }
    return json
  } catch (e) {
    console.error(`Failed verification API call`, e)
    // Sentry.captureException(e)
  }
}

function isSuccessStatusCode(statusCode) {
  return statusCode >= 200 && statusCode <= 299
}

export const isVerified = async ({
  contractAddress,
  chainId,
}: EtherscanParams) => {
  // parse URL
  const params = new URLSearchParams({
    action: 'getabi',
    address: contractAddress,
    module: 'contract',
  })

  const res = await fetchEtherscan({ chainId, params })
  const { status, result, message } = res
  const isVerified = status === '1'
  return { isVerified, message, result, status }
}

export function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

// return source code from Etherscan
export const getContractSourceCode = async ({ contractAddress, chainId }) => {
  const params = new URLSearchParams({
    action: 'getsourcecode',
    address: contractAddress,
    module: 'contract',
  })

  const res = await fetchEtherscan({ chainId, params })
  return res
}
