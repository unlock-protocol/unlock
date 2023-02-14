/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'ethers'
import { networks } from '@unlock-protocol/networks'

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
        const provider = new ethers.providers.JsonRpcBatchProvider(
          network.provider
        )
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
