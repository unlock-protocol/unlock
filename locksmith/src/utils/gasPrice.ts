import { ethers, utils, BigNumber } from 'ethers'
import networks from '@unlock-protocol/networks'

import PriceConversion from './priceConversion'

export default class GasPrice {
  // gasCost is expressed in gas
  async gasPriceETH(network: number, gasCost: number): Promise<number> {
    const providerUrl = networks[network].publicProvider
    const provider = new ethers.providers.JsonRpcProvider(providerUrl)

    // Price of gas (in wei)
    const gasPrice: any = await provider.getGasPrice()
    const gasPriceETH = parseFloat(
      utils.formatEther(BigNumber.from(gasPrice).mul(BigNumber.from(gasCost)))
    )
    return gasPriceETH
  }

  // Gas price denominated in cents by default
  // Multiply base to get more accurate
  async gasPriceUSD(network: number, gasCost: number): Promise<number> {
    const gasPrice = await this.gasPriceETH(network, gasCost)
    // Cost in currency
    let symbol = 'ETH'
    if (network === 100) {
      symbol = 'DAI'
    }
    if (network === 137) {
      symbol = 'MATIC'
    }
    // TODO: support more "native" currencies
    const priceConversion = new PriceConversion()
    return priceConversion.convertToUSD(symbol, gasPrice)
  }
}
