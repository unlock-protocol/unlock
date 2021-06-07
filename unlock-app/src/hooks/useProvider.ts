import { ethers } from 'ethers'
import { useState, useContext } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'
import ProviderContext from '../contexts/ProviderContext'
import UnlockProvider from '../services/unlockProvider'

export interface EthereumWindow extends Window {
  web3: any
  ethereum: any
}

/**
 * Initializes a provider passed
 * @param providerAdapter
 */
export const useProvider = (config: any) => {
  const { setProvider, provider } = useContext(ProviderContext)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [walletService, setWalletService] = useState<any>()
  const [network, setNetwork] = useState<string | undefined>(undefined)
  const [account, setAccount] = useState<string | undefined>(undefined)
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [isUnlockAccount, setIsUnlockAccount] = useState<boolean>(false)
  const [encryptedPrivateKey, setEncryptedPrivateKey] = useState<
    any | undefined
  >(undefined)

  const resetProvider = async (provider: any) => {
    setError('')
    try {
      const _walletService = new WalletService(config.networks)

      let _network
      if (provider instanceof ethers.providers.Provider) {
        setProvider(provider)
        // @ts-expect-error
        _network = await _walletService.connect(provider)
      } else {
        // walletService wants an ethers provider!
        provider = new ethers.providers.Web3Provider(provider)
        setProvider(provider)
        _network = await _walletService.connect(provider)
      }
      setNetwork(_network || undefined)

      const _account = await _walletService.getAccount()

      setWalletService(_walletService)
      setAccount(_account || undefined)
      setIsUnlockAccount(provider.isUnlock)
      setEmail(provider.emailAddress)
      setEncryptedPrivateKey(provider.passwordEncryptedPrivateKey)
    } catch (error) {
      if (error.message.startsWith('Missing config')) {
        setError(
          'Unlock is currently not deployed on this network. Please switch network and refresh the page'
        )
      } else {
        setError(error.message)
      }
      setProvider(null)
      console.error(error)
    }
  }

  const connectProvider = async (provider: any) => {
    setLoading(true)

    provider.on('accountsChanged', () => {
      resetProvider(provider)
    })

    provider.on('chainChanged', () => {
      resetProvider(provider)
    })

    await resetProvider(provider)
    setLoading(false)
  }

  const disconnectProvider = async () => {
    setLoading(true)
    const _walletService = new WalletService(config.networks)
    setWalletService(_walletService)
    setNetwork(undefined)
    setAccount(undefined)
    setIsUnlockAccount(false)
    setEmail('')
    setEncryptedPrivateKey(null)
    setProvider(null)
    setLoading(false)
  }

  const changeNetwork = async (network: any) => {
    // Let's behave differently based on the provider?
    if (provider.isUnlock) {
      // We need to reconnect!
      const newProvider = UnlockProvider.reconnect(provider, network)
      resetProvider(newProvider)
    } else {
      // Check if network can be changed
      try {
        await provider.send('wallet_addEthereumChain', [
          {
            chainId: `0x${network.id.toString(16)}`,
            chainName: network.name,
            rpcUrls: [network.provider],
            nativeCurrency: network.nativeCurrency,
          },
          account,
        ])
      } catch (error) {
        window.alert(
          'Network could not be changed. Please change it from your wallet.'
        )
      }
    }
  }

  return {
    loading,
    network,
    account,
    email,
    isUnlockAccount,
    encryptedPrivateKey,
    walletService,
    connectProvider,
    disconnectProvider,
    error,
    changeNetwork,
  }
}
