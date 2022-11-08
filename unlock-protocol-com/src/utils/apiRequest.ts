/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
import { ethers } from 'ethers'
import { networks } from '@unlock-protocol/networks'

export const { get, all, post, put, spread } = axios

async function getGdpForNetwork(provider, network) {
  const abi = ['function grossNetworkProduct() constant view returns (uint256)']
  const contract = new ethers.Contract(network.unlockAddress, abi, provider)
  const gnp = await contract.grossNetworkProduct()
  return gnp
}

export async function getGNPs() {
  const values = await Promise.all(
    Object.keys(networks).map(async (id) => {
      try {
        const network = networks[id]
        if (!network.unlockAddress) {
          return null
        }
        const provider = new ethers.providers.JsonRpcProvider(network.provider)
        const gdp = await getGdpForNetwork(provider, network)
        const total = parseFloat(ethers.utils.formatUnits(gdp, '18'))
        return { total, network }
      } catch (error) {
        console.error('Error retrieving data for', id)
        console.error(error)
        return null
      }
    })
  )
  return values.filter((x) => !!x)
}

type SubgraphAPIResponse = {
  data: {
    data?: any
    errors?: any[]
  }
  status: number
  statusText: string
  config: any
  request: any
  headers: any
}

type SubgraphResponse = {
  data: any
}

export async function querySubgraph(subgraphUrl: string, query: string) {
  try {
    const response: SubgraphAPIResponse = await axios.post(`${subgraphUrl}`, {
      query,
    })
    if (response.data.errors !== undefined && response.data.errors.length > 0) {
      throw Error(
        response.data.errors[0].message ||
          'Error: retrieving data from subgraph'
      )
    }
    return {
      data: response.data.data,
    }
  } catch (error) {
    console.error('subgraph error', error)
    throw error
  }
}
