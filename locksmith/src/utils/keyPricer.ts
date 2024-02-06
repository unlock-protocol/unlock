import { ethers } from 'ethers'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import PriceConversion from './priceConversion'
import { GAS_COST_TO_GRANT } from './constants'
import { getProviderForNetwork, getPurchaser } from '../fulfillment/dispatcher'

// @deprecated - Remove once no longer used anywhere. Use functions in pricing.ts instead.
export default class KeyPricer {
  readOnlyEthereumService: any

  constructor() {
    this.readOnlyEthereumService = new Web3Service(networks)
  }

  async canAffordGrant(
    network: number
  ): Promise<{ canAfford: boolean; reason?: string }> {
    if (!networks[network].maxFreeClaimCost) {
      return { canAfford: false, reason: 'No free claim on this network' }
    }
    if (networks[network].fullySubsidizedGas) {
      return { canAfford: true }
    }
    const [provider, wallet] = await Promise.all([
      getProviderForNetwork(network),
      getPurchaser({ network }),
    ])
    const [gasPrice, balance] = await Promise.all([
      provider.getGasPrice(),
      provider.getBalance(await wallet.getAddress()),
    ])
    const gasCost = gasPrice.mul(GAS_COST_TO_GRANT)
    // Balance is too low to afford the gas cost
    if (balance.lt(gasCost)) {
      return { canAfford: false, reason: 'Insufficient purchaser balance' }
    }
    // And now check the value in USD
    const symbol = networks[network].nativeCurrency.symbol
    const priceConversion = new PriceConversion()
    const usdPrice = await priceConversion.convertToUSD(
      symbol,
      parseFloat(ethers.utils.formatEther(gasCost).toString())
    )
    if (usdPrice > networks[network].maxFreeClaimCost!) {
      return { canAfford: false, reason: `Gas costs too high: $${usdPrice}` }
    }
    return { canAfford: true }
  }
}
