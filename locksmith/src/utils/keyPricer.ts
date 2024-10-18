import networks from '@unlock-protocol/networks'
import { GAS_COST_TO_GRANT } from './constants'
import { getProviderForNetwork, getPurchaser } from '../fulfillment/dispatcher'
import GasPrice from './gasPrice'

// @deprecated - Remove once no longer used anywhere. Use functions in pricing.ts instead.
export default class KeyPricer {
  async canAffordGrant(
    network: number
  ): Promise<{ canAfford: boolean; reason?: string }> {
    if (!networks[network].maxFreeClaimCost) {
      return { canAfford: false, reason: 'No free claim on this network' }
    }
    if (networks[network].fullySubsidizedGas) {
      return { canAfford: true }
    }
    const [gasCost, balance] = await Promise.all([
      new GasPrice().gasPriceUSD(network, GAS_COST_TO_GRANT),
      (await getProviderForNetwork(network)).getBalance(
        await (await getPurchaser({ network })).getAddress()
      ),
    ])
    // Balance is too low to afford the gas cost
    if (balance < gasCost) {
      return { canAfford: false, reason: 'Insufficient purchaser balance' }
    }

    if (gasCost > networks[network].maxFreeClaimCost!) {
      return {
        canAfford: false,
        reason: `Gas costs too high: $${gasCost / 100}`,
      }
    }
    return { canAfford: true }
  }
}
