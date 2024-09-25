import { ethers } from 'ethers'
import networks from '@unlock-protocol/networks'
import { getDefiLlamaPrice } from '../operations/pricingOperations'

export default class GasPrice {
  // gasCost is expressed in gas, returns cost in base currency (ether on mainnet...)
  async gasPriceETH(
    network: number,
    gasCost: bigint | number
  ): Promise<number> {
    const providerUrl = networks[network].provider
    const provider = new ethers.JsonRpcProvider(providerUrl)

    const feeData = await provider.getFeeData()
    const gasPrice = feeData.gasPrice || BigInt(0)
    const gasPriceETH = parseFloat(
      ethers.formatEther(gasPrice * BigInt(gasCost.toString()))
    )
    return gasPriceETH
  }

  // Gas price denominated in cents
  async gasPriceUSD(
    network: number,
    gasCost: bigint | number
  ): Promise<number> {
    // Adding an excption for chains for which gas is fully subsidized
    if (networks[network].fullySubsidizedGas) {
      return 0
    }

    const gasPrice = await this.gasPriceETH(network, gasCost)
    const price = await getDefiLlamaPrice({
      network,
      amount: gasPrice,
    })
    if (!price.priceInAmount) {
      throw new Error(`Price not available`)
    }
    return Math.ceil(price.priceInAmount * 100)
  }
}
