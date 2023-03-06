import { ethers, utils, BigNumber } from 'ethers'
import networks from '@unlock-protocol/networks'
import { defiLammaPrice } from './pricing'

export default class GasPrice {
  // gasCost is expressed in gas, returns cost in base currency (ether on mainnet...)
  async gasPriceETH(network: number, gasCost: number): Promise<number> {
    const providerUrl = networks[network].publicProvider
    const provider = new ethers.providers.JsonRpcBatchProvider(providerUrl)

    const gasPrice: any = await provider.getGasPrice()
    const gasPriceETH = parseFloat(
      utils.formatEther(BigNumber.from(gasPrice).mul(BigNumber.from(gasCost)))
    )
    return gasPriceETH
  }

  // Gas price denominated in cents
  async gasPriceUSD(network: number, gasCost: number): Promise<number> {
    const gasPrice = await this.gasPriceETH(network, gasCost)
    const pricing = await defiLammaPrice({
      network,
      amount: gasPrice,
    })

    if (!pricing) {
      throw new Error(`Missing pricing for network ${network}`)
    }
    return pricing.priceInAmount! * 100
  }
}
