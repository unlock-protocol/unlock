import { WalletService } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { ethers } from 'ethers'
import fetch from 'isomorphic-fetch'
import logger from '../logger'

const config = require('../../config/config')
const { GAS_COST } = require('../utils/keyPricer')

interface GasSettings {
  maxFeePerGas?: ethers.BigNumber
  maxPriorityFeePerGas?: ethers.BigNumber
  gasPrice?: ethers.BigNumber
}

export const getGasSettings = async (network: number): Promise<GasSettings> => {
  // workaround for polygon: get max fees from gas station
  // see https://github.com/ethers-io/ethers.js/issues/2828
  if (network === 137) {
    try {
      const resp = await fetch('https://gasstation-mainnet.matic.network/v2')
      const { data } = await resp.json()

      const maxFeePerGas = ethers.utils
        .parseUnits(`${Math.ceil(data.standard.maxFee)}`, 'gwei')
        .mul(2)

      const maxPriorityFeePerGas = ethers.utils
        .parseUnits(`${Math.ceil(data.standard.maxPriorityFee)}`, 'gwei')
        .mul(2)

      return {
        maxFeePerGas,
        maxPriorityFeePerGas,
      }
    } catch {
      // ignore
    }
  }

  // get fees from network provider
  const provider = new ethers.providers.JsonRpcProvider(
    networks[network].publicProvider
  )

  const feedata = await provider.getFeeData().catch(() => null)

  if (feedata) {
    const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = feedata

    // We double to increase speed of execution
    // We may end up paying *more* but we get mined earlier
    return {
      maxPriorityFeePerGas: maxFeePerGas?.mul(ethers.BigNumber.from('2')),
      maxFeePerGas: maxPriorityFeePerGas || undefined,
      gasPrice: gasPrice?.mul(ethers.BigNumber.from('2')),
    }
  }

  // fallback to 40 gwei if no feeData
  return {
    maxFeePerGas: ethers.BigNumber.from(40000000000),
    maxPriorityFeePerGas: ethers.BigNumber.from(40000000000),
  }
}

export default class Dispatcher {
  async balances() {
    const balances = await Promise.all(
      Object.values(networks).map(async (network: any) => {
        try {
          const provider = new ethers.providers.JsonRpcProvider(
            network.publicProvider
          )
          const wallet = new ethers.Wallet(config.purchaserCredentials)
          const balance = await provider.getBalance(wallet.address)
          return [
            network.id,
            {
              address: wallet.address,
              balance: ethers.utils.formatEther(balance),
            },
          ]
        } catch (error) {
          logger.error(error)
          return [network.id, {}]
        }
      })
    )
    // @ts-expect-error
    const entries = new Map(balances)
    return Object.fromEntries(entries)
  }

  /**
   * Called to grant key to user!
   */
  async grantKeys(
    lockAddress: string,
    recipients: string[],
    network: number,
    cb?: any
  ) {
    const walletService = new WalletService(networks)

    const provider = new ethers.providers.JsonRpcProvider(
      networks[network].publicProvider
    )

    const walletWithProvider = new ethers.Wallet(
      config.purchaserCredentials,
      provider
    )

    const transactionOptions = await getGasSettings(network)

    await walletService.connect(provider, walletWithProvider)
    return walletService.grantKeys(
      {
        lockAddress,
        recipients,
        transactionOptions,
      },
      cb
    )
  }

  async hasFundsForTransaction(network: number) {
    const provider = new ethers.providers.JsonRpcProvider(
      networks[network].publicProvider
    )

    const wallet = new ethers.Wallet(config.purchaserCredentials, provider)

    const gasPrice = await provider.getGasPrice()

    const balance = await provider.getBalance(wallet.address)
    if (balance.lt(gasPrice.mul(GAS_COST))) {
      logger.warn(
        `Purchaser ${
          wallet.address
        } does not have enough coins (${ethers.utils.formatUnits(
          balance,
          '18'
        )}) to pay for gas (${ethers.utils.formatUnits(
          gasPrice.mul(GAS_COST)
        )}) on ${network}`
      )
      return false
    }
    return true
  }

  async purchaseKey(
    lockAddress: string,
    owner: string,
    network: number,
    cb?: any
  ) {
    const walletService = new WalletService(networks)

    const provider = new ethers.providers.JsonRpcProvider(
      networks[network].publicProvider
    )

    const walletWithProvider = new ethers.Wallet(
      config.purchaserCredentials,
      provider
    )
    await walletService.connect(provider, walletWithProvider)

    return await walletService.purchaseKey(
      {
        lockAddress,
        owner,
      },
      cb
    )
  }

  async renewMembershipFor(
    network: number,
    lockAddress: string,
    keyId: number
  ) {
    const walletService = new WalletService(networks)
    const provider = new ethers.providers.JsonRpcProvider(
      networks[network].publicProvider
    )

    const walletWithProvider = new ethers.Wallet(
      config.purchaserCredentials,
      provider
    )

    await walletService.connect(provider, walletWithProvider)

    // get lock
    const lock = await walletService.getLockContract(lockAddress)

    // TODO: use team multisig here (based on network config) instead of purchaser address!
    const referrer = walletWithProvider.address

    // send tx with custom gas
    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasSettings(network)
    return await lock.renewMembershipFor(keyId, referrer, {
      maxFeePerGas,
      maxPriorityFeePerGas,
    })
  }
}
