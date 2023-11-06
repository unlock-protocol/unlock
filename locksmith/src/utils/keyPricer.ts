import { ethers } from 'ethers'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import logger from '../logger'
import * as Normalizer from './normalizer'
import { ItemizedKeyPrice } from '../types'
import PriceConversion from './priceConversion'
import GasPrice from './gasPrice'
import {
  GAS_COST,
  stripePercentage,
  baseStripeFee,
  GAS_COST_TO_GRANT,
} from './constants'
import { getProviderForNetwork, getPurchaser } from '../fulfillment/dispatcher'

const ZERO = ethers.constants.AddressZero

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

  async keyPriceUSD(lockAddress: string, network: number) {
    // can we reduce load here?
    const lock = await this.readOnlyEthereumService.getLock(
      Normalizer.ethereumAddress(lockAddress),
      network,
      { fields: ['currencyContractAddress', 'currencySymbol', 'keyPrice'] }
    )

    let symbol =
      networks[network]?.nativeCurrency?.coinbase ||
      networks[network]?.nativeCurrency?.symbol
    if (lock?.currencyContractAddress !== ZERO && lock.currencySymbol) {
      symbol = lock.currencySymbol
    }
    if (!symbol) {
      logger.info(
        `We could not determine currency symbol for ${lockAddress} on ${network}`
      )
      throw new Error(`Missing currency`)
    }
    // If key is free, no need to convert!
    if (lock.keyPrice === '0') {
      return 0
    }
    const priceConversion = new PriceConversion()
    const usdPrice = await priceConversion.convertToUSD(
      symbol.toUpperCase(),
      lock.keyPrice
    )
    return usdPrice
  }

  // Fee denominated in cents by default. multiply base to get more accurate
  async gasFee(network: number, base?: number): Promise<number> {
    if (!base) {
      base = 1
    }

    const gasPrice = new GasPrice()
    // Price of gas
    const gasCost = (await gasPrice.gasPriceUSD(network, GAS_COST)) * base
    return gasCost
  }

  // Fee denominated in cents
  creditCardProcessingFee(subtotal: number): number {
    // This is rounded up to an integer number of cents.
    const percentageFee = Math.ceil(subtotal * stripePercentage)

    return baseStripeFee + percentageFee
  }

  // Fee denominated in cents
  unlockServiceFee(cost: number): number {
    return Math.ceil(cost * 0.1) // Unlock charges 10% of transaction.
  }

  async generate(
    lockAddress: string,
    network: number,
    quantity = 1
  ): Promise<ItemizedKeyPrice> {
    const [usdKeyPrice, gasFee] = await Promise.all([
      this.keyPriceUSD(lockAddress, network),
      this.gasFee(network),
    ])
    const usdKeyPricing = usdKeyPrice * quantity
    let unlockServiceFee = gasFee

    //  Temporary : for some locks, Unlock labs does not take credit card fees (only gas)
    if (
      ['0x339D848115981125eEfBA2F654E1F9644363c7DB'].indexOf(lockAddress) === -1
    ) {
      unlockServiceFee += this.unlockServiceFee(usdKeyPricing)
    }

    return {
      keyPrice: usdKeyPricing, // shows price for all of the keys
      unlockServiceFee,
      creditCardProcessing: this.creditCardProcessingFee(
        usdKeyPricing + unlockServiceFee
      ),
    }
  }
}
