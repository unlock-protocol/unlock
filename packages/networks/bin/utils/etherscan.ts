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

async function fetchEtherscan({
  params,
  chainId,
}: {
  params: URLSearchParams
  chainId: string | number | bigint
}) {
  // get etherscan API URLs and keys
  const { apiKey: apiKeys, customChains } = etherscan
  const chains = [...builtinChains, ...customChains]

  const { urls, network } = chains.find((chain) => chain.chainId == chainId)
  console.log(urls)
  const apiKey = apiKeys[network]

  params.append('apikey', apiKey)
  const url = new URL(urls.apiURL)
  url.search = params.toString()

  console.log(url.toString())
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

// This gets the fist tx in the list in etherscan
// NB: there is a potential for error, if any value has been sent to the contract address before creation for instance
export const getCreationTx = async ({
  contractAddress,
  chainId,
}: EtherscanParams) => {
  // parse URL
  const params = new URLSearchParams({
    action: 'txlist',
    address: contractAddress,
    // endblock: '99999999',
    module: 'account',
    offset: '1',
    page: '1',
    sort: 'asc',
  })

  const res = await fetchEtherscan({ chainId, params })
  const { status, result, message } = res
  const bytecode = result[0].input
  return {
    bytecode,
    message,
    result,
    status,
  }

  // https://api.etherscan.io/api?module=account&action=txlist&address=0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=YourApiKeyToken
  // https://api.etherscan.io/api?module=account&action=txlistinternal&address=0x2c1ba59d6f58433fb1eaee7d20b26ed83bda51a3&startblock=0&endblock=2702578&page=1&offset=10&sort=asc&apikey=YourApiKeyToken
}

export function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
