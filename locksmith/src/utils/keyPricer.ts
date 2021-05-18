import { ethers } from 'ethers'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { ItemizedKeyPrice } from '../types' // eslint-disable-line no-unused-vars, import/no-unresolved
import PriceConversion from './priceConversion'
import { getPrice } from './ethPrice'
import networks from '../networks'
// Stripe's fee is 30 cents plus 2.9% of the transaction.
const baseStripeFee = 30
const stripePercentage = 0.029
const ZERO = ethers.constants.AddressZero

export default class KeyPricer {
  readOnlyEthereumService: any

  constructor() {
    this.readOnlyEthereumService = new Web3Service(networks)
  }

  async keyPrice(lockAddress: string, network: number): Promise<number> {
    const lock = await this.readOnlyEthereumService.getLock(
      lockAddress,
      network
    )
    return Math.round(Number(lock.keyPrice) * 100)
  }

  async keyPriceUSD(lockAddress: string, network: number): Promise<number> {
    let symbol: string

    const lock = await this.readOnlyEthereumService.getLock(
      lockAddress,
      network
    )
    if (lock.tokenAddress == ZERO) {
      symbol = 'ETH'
    } else {
      symbol = lock.erc20Symbol
    }

    const priceConversion = new PriceConversion()
    return priceConversion.convertToUSD(symbol, lock.keyPrice)
  }

  // Fee denominated in cents
  async gasFee(): Promise<number> {
    // eslint-disable-next-line new-cap
    const provider = ethers.getDefaultProvider('mainnet')
    const keyPurchaseGas = 200000 // harcoded : TODO get estimate
    const gasPrice: any = await provider.getGasPrice()
    const costInGwei = gasPrice * keyPurchaseGas
    const ethCost = parseFloat(
      ethers.utils.formatEther(
        ethers.utils.parseUnits(costInGwei.toString(), 'wei')
      )
    )
    const ethPrice = await getPrice()
    return Math.ceil(ethCost * ethPrice * 100)
  }

  // Fee denominated in cents
  creditCardProcessingFee(subtotal: number): number {
    // This is rounded up to an integer number of cents.
    const percentageFee = Math.ceil(subtotal * stripePercentage)

    return baseStripeFee + percentageFee
  }

  // Fee denominated in cents
  unlockServiceFee(): number {
    return 50
  }

  async generate(
    lockAddress: string,
    network: number
  ): Promise<ItemizedKeyPrice> {
    const keyPrice = await this.keyPrice(lockAddress, network)
    const gasFee = await this.gasFee()
    const unlockServiceFee = this.unlockServiceFee()
    return {
      keyPrice,
      gasFee,
      unlockServiceFee,
      creditCardProcessing: this.creditCardProcessingFee(
        keyPrice + gasFee + unlockServiceFee
      ),
    }
  }
}
