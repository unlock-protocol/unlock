import { useEffect, useState } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'

export interface EthereumWindow extends Window {
  web3: any
  ethereum: any
}

/**
 * Initializes a provider passed
 * @param providerAdapter
 */
export const useProvider = (
  providerAdapter: any,
  walletService: WalletService
) => {
  const [loading, setLoading] = useState(true)
  const [network, setNetwork] = useState<string | undefined>(undefined)
  const [account, setAccount] = useState<string | undefined>(undefined)
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [encryptedPrivateKey, setEncryptedPrivateKey] = useState<
    any | undefined
  >(undefined)

  const initializeProvider = async (provider: any) => {
    if (provider.enable) {
      try {
        await provider.enable()
      } catch {
        alert('PLEASE ENABLE PROVIDER!')
      }
    }

    setNetwork((await walletService.connect(provider)) || undefined)
    setAccount((await walletService.getAccount()) || undefined)
    setEmail(provider.emailAddress)
    setEncryptedPrivateKey(provider.passwordEncryptedPrivateKey)
    setLoading(false)
  }

  useEffect(() => {
    initializeProvider(providerAdapter)
  }, [])
  return {
    loading,
    network,
    account,
    email,
    encryptedPrivateKey,
    walletService,
  }
}
