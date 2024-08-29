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

export const getContractSourceCode = async ({ contractAddress, chainId }) => {
  // parse URL
  const params = new URLSearchParams({
    action: 'getsourcecode',
    address: contractAddress,
    module: 'contract',
  })

  const res = await fetchEtherscan({ chainId, params })
  return res
  // const { status, result, message } = res
  // const isVerified = status === '1'
  // return { isVerified, message, result, status }
}

// /api?module=contract&action=getsourcecode&address=0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413&apikey=YourApiKeyToken

export const verifyContract = async ({
  chainId,
  contractAddress,
  contractName = 'Unlock',
  compilerversion = 'v0.8.21+commit.d9974bed',
  source,
}) => {
  const { apiKey, apiURL } = getCredentials(chainId)

  const params = {
    action: 'verifysourcecode',
    apikey: apiKey,
    codeformat: 'solidity-single-file',
    compilerversion,
    contractaddress: contractAddress,
    contractname: contractName,
    module: 'contract',
    optimizationUsed: '1',
    runs: '80',
    sourceCode: source,
  }

  const url = new URL(apiURL)
  // fetch contract status
  try {
    const response = await fetch(url.toString(), {
      body: new URLSearchParams(params),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    })
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
    console.error(`Failed contract verification API call`, e)
    // Sentry.captureException(e)
  }

  // const res = await fetchEtherscan({ chainId, params })
  // console.log(res)
}
