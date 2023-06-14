/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'ethers'
import { networks } from '@unlock-protocol/networks'

async function getGdpForNetwork(provider, network) {
  const abi = ['function grossNetworkProduct() constant view returns (uint256)']
  const contract = new ethers.Contract(network.unlockAddress, abi, provider)
  let gnp = await contract.grossNetworkProduct()
  if (network.id === 1) {
    // temp fix until we fix GNP on mainnet!
    gnp = 0
  }
  if (network.previousDeploys) {
    for (let i = 0; i < network.previousDeploys.length; i++) {
      try {
        const previousContract = new ethers.Contract(
          network.previousDeploys[i].unlockAddress,
          abi,
          provider
        )
        const previousGnp = await previousContract.grossNetworkProduct()
        gnp = previousGnp.add(gnp)
      } catch (error) {
        console.error(
          `Error retrieving GNP for ${network.name} at ${network.previousDeploys[i].name}`,
          error
        )
      }
    }
  }
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
