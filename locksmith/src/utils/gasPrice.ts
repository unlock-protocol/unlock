import { ethers, utils, BigNumber } from 'ethers'
import networks from '@unlock-protocol/networks'

import PriceConversion from './priceConversion'

export default class GasPrice {
  // gasCost is expressed in gas, returns cost in base currency (ether on mainnet...)
  async gasPriceETH(network: number, gasCost: number): Promise<number> {
    const providerUrl = networks[network].provider
    const provider = new ethers.providers.JsonRpcBatchProvider(providerUrl)

    const gasPrice: any = await provider.getGasPrice()
    const gasPriceETH = parseFloat(
      utils.formatEther(BigNumber.from(gasPrice).mul(BigNumber.from(gasCost)))
    )
    return gasPriceETH
  }

  // Gas price denominated in cents
  async gasPriceUSD(network: number, gasCost: number): Promise<number> {
    // Adding an excption for chains for which gas is fully subsidized
    if (networks[network].fullySubsidizedGas) {
      return 0
    }

    const gasPrice = await this.gasPriceETH(network, gasCost)
    const symbol = networks[network].nativeCurrency?.symbol || 'ETH' // default to ether
    const priceConversion = new PriceConversion()
    const usdPrice = await priceConversion.convertToUSD(symbol, gasPrice)
    return usdPrice
  }
}
