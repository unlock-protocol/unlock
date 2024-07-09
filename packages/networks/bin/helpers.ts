import { ethers } from 'ethers'
import networks from '../src'
import ERC20 from '../utils/erc20.abi.json'
import { contracts } from '@unlock-protocol/contracts'

const expectedKeys = Object.keys(networks['1'])

export const validateKeys = (network) => {
  const missingProperties: string[] = []
  expectedKeys.forEach((key) => {
    if (!(key in network)) {
      missingProperties.push(key as string)
    }
  })
  return missingProperties
}

export const validateERC20 = async ({ token, chainId }) => {
  const errors: string[] = []
  const warnings: string[] = []
  const network = networks[chainId]
  // unlock contract
  const provider = new ethers.JsonRpcProvider(network.provider)
  const unlock = new ethers.Contract(
    network.unlockAddress,
    ['function uniswapOracles(address) view returns (address)'],
    provider
  )

  const contract = new ethers.Contract(token.address, ERC20, provider)

  const symbol = await contract.symbol()
  const name = await contract.name()
  const decimals = parseInt(await contract.decimals())
  if (decimals !== token.decimals) {
    errors.push(
      `Decimals mismatch for ${token.address} on ${chainId}. It needs to be "${decimals}"`
    )
  }
  if (name !== token.name) {
    errors.push(
      `Name mismatch for ${token.address} on ${chainId}. It needs to be "${name}"`
    )
  }
  if (symbol !== token.symbol) {
    errors.push(
      `Symbol mismatch for ${token.address} on ${chainId}. It needs to be "${symbol}"`
    )
  }

  // check if oracle is set in Unlock
  if (token.symbol !== 'WETH' && network.uniswapV3) {
    const isSetInUnlock =
      (await unlock.uniswapOracles(token.address)) !== ethers.ZeroAddress

    if (!isSetInUnlock) {
      warnings.push(
        `Oracle for token ${name} (${symbol}) at ${token.address} on ${network.name} (${chainId}) is not set correctly`
      )
    }
  }
  return { errors, warnings }
}

export const validateBytecode = async ({
  contractAddress,
  providerURL,
  contractName = 'UnlockV13',
}) => {
  const { bytecode } = contracts[contractName]
  const provider = new ethers.JsonRpcProvider(providerURL)
  const deployedByteCode = await provider.getCode(contractAddress)
  return deployedByteCode === bytecode
}

const fetchGraph = async (query, url) => {
  const req = await fetch(url, {
    body: JSON.stringify({ query }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  return await req.json()
}

const getLatestSubgraphDeployment = async (url) => {
  const query = `{
    _meta{
      deployment
    }
  }`
  const { data } = await fetchGraph(query, url)
  if (!data._meta) console.log(data, url)
  const { deployment } = data._meta
  return deployment
}

export const checkSubgraph = async (endpoint: string) => {
  const errors: string[] = []
  // get latest deployment id
  let deploymentId
  try {
    deploymentId = await getLatestSubgraphDeployment(endpoint)
  } catch (error) {
    errors.push(
      `❌ failed to fetch latest deployment from The Graph (${endpoint})! (${error})`
    )
    return errors
  }

  let status
  if (deploymentId) {
    const query = `{
      indexingStatuses(subgraphs: ["${deploymentId}"]) {
        synced
        health
        fatalError {
          message
          block {
            number
            hash
          }
          handler
        }
        chains {
          network
        }
      }
    }`

    const {
      data: { indexingStatuses },
    } = await fetchGraph(query, endpoint)
    ;[status] = indexingStatuses
  }

  // parse errors
  if (status) {
    if (!status.synced) {
      errors.push(`❌ Subgraph is out of sync!`)
    }
    if (status.health !== 'healthy') {
      errors.push(`❌ Subgraph is failing: ${status.fatalError?.message}`)
    }
  } else {
    errors.push(`⚠️: Missing health status for subgraph `)
  }

  return errors
}
