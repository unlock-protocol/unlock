import { ethers } from 'ethers'
import { useState } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'

export interface EthereumWindow extends Window {
  web3: any
  ethereum: any
}

/**
 * Initializes a provider passed
 * @param providerAdapter
 */
export const useProvider = (config: any) => {
  const [loading, setLoading] = useState(false)
  const [walletService, setWalletService] = useState<any>()
  const [network, setNetwork] = useState<string | undefined>(undefined)
  const [account, setAccount] = useState<string | undefined>(undefined)
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [encryptedPrivateKey, setEncryptedPrivateKey] = useState<
    any | undefined
  >(undefined)

  const connectProvider = async (provider: any, callback: any) => {
    setLoading(true)
    if (provider.enable) {
      try {
        await provider.enable()
      } catch {
        alert('PLEASE ENABLE PROVIDER!')
      }
    }

    // We need the network!!
    const _walletService = new WalletService(config.networks)

    setWalletService(_walletService)

    // walletService wants an ethers provider
    const _network = await _walletService.connect(
      new ethers.providers.Web3Provider(provider)
    )
    setNetwork(_network || undefined)

    const _account = await _walletService.getAccount()
    setAccount(_account || undefined)
    setEmail(provider.emailAddress)
    setEmail(provider.emailAddress)
    setEncryptedPrivateKey(provider.passwordEncryptedPrivateKey)
    if (callback) {
      callback(_account)
    }
    setLoading(false)
  }

  return {
    loading,
    network,
    account,
    email,
    encryptedPrivateKey,
    walletService,
    connectProvider,
  }
}
