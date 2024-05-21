import { ethers, formatEther } from 'ethers'
import { networks } from '@unlock-protocol/networks'

async function getGdpForNetwork({
  provider,
  unlockAddress,
  previousDeploys,
  name,
  id,
}) {
  const abi = ['function grossNetworkProduct() constant view returns (uint256)']
  const contract = new ethers.Contract(unlockAddress, abi, provider)
  let gnp = await contract.grossNetworkProduct()
  if (id === 1) {
    // temp fix until we fix GNP on mainnet!
    gnp = 0
  }
  if (previousDeploys) {
    for (let i = 0; i < previousDeploys.length; i++) {
      try {
        const previousContract = new ethers.Contract(
          previousDeploys[i].unlockAddress,
          abi,
          provider
        )
        const previousGnp = await previousContract.grossNetworkProduct()
        gnp = previousGnp + gnp
      } catch (error) {
        console.error(
          `Error retrieving GNP for ${name} at ${previousDeploys[i].name}`,
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
        const {
          unlockAddress,
          chain,
          name,
          provider: providerUrl,
          previousDeploys,
          isTestNetwork,
          nativeCurrency,
        } = networks[id]
        if (!unlockAddress) {
          return null
        }
        const provider = new ethers.JsonRpcProvider(providerUrl)
        const gdp = await getGdpForNetwork({
          provider,
          unlockAddress,
          previousDeploys,
          name,
          id,
        })
        const total = parseFloat(formatEther(gdp))
        return {
          total,
          chain,
          name,
          isTestNetwork,
          nativeCurrencySymbol: nativeCurrency.symbol,
        }
      } catch (error) {
        console.error('Error retrieving data for', id)
        console.error(error)
        return null
      }
    })
  )
  return values.filter((x) => !!x)
}
