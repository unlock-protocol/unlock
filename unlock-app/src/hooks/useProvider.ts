import { ethers } from 'ethers'
import { useState, useContext, useEffect } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'
import ProviderContext from '../contexts/ProviderContext'
import UnlockProvider from '../services/unlockProvider'
import { useAppStorage } from './useAppStorage'
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
  const [signedMessage, setSignedMessage] = useState<string | undefined>(
    undefined
  )
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [isUnlockAccount, setIsUnlockAccount] = useState<boolean>(false)
  const [encryptedPrivateKey, setEncryptedPrivateKey] = useState<
    any | undefined
  >(undefined)
  const { getStorage, setStorage, clearStorage } = useAppStorage()

  useEffect(() => {
    if (!getStorage('account') && account) {
      setStorage('account', account)
    }

    if (!getStorage('network') && network) {
      setStorage('network', network)
    }
  }, [account, network, provider])

  const resetProvider = async (
    provider: ethers.providers.Provider,
    messageToSign?: string
  ) => {
    setError('')
    try {
      const _walletService = new WalletService(config.networks)

      setProvider(provider)
      // @ts-expect-error TODO fix walletService signature
      const _network = await _walletService.connect(provider)
      setNetwork(_network || undefined)

      const _account = await _walletService.getAccount()
      let _signedMessage
      if (messageToSign) {
        // @ts-expect-error
        _signedMessage = await _walletService.signMessage(
          messageToSign,
          'personal_sign'
        )

        setSignedMessage(_signedMessage)
      }
      setWalletService(_walletService)
      setAccount(_account || undefined)
      // @ts-expect-error
      if (!provider.isUnlock) {
        return {
          network: _network,
          account: _account,
          signedMessage: _signedMessage,
        }
      }
      // @ts-expect-error
      setIsUnlockAccount(provider.isUnlock)
      // @ts-expect-error
      setEmail(provider.emailAddress)
      // @ts-expect-error
      setEncryptedPrivateKey(provider.passwordEncryptedPrivateKey)
      return {
        network: _network,
        account: _account,
        signedMessage: _signedMessage,
        // @ts-expect-error
        isUnlock: provider.isUnlock,
        // @ts-expect-error
        email: provider.emailAddress,
        // @ts-expect-error
        passwordEncryptedPrivateKey: provider.passwordEncryptedPrivateKey,
      }
    } catch (error: any) {
      if (error.message.startsWith('Missing config')) {
        setError(
          `Unlock is currently not deployed on this network. Please switch network and refresh the page: ${error.message}`
        )
      } else {
        setError(error.message)
      }
      setProvider(null)
      console.error(error)
      return {}
    }
  }

  const connectProvider = async (provider: any, messageToSign: string) => {
    setLoading(true)
    let auth
    if (provider instanceof ethers.providers.Provider) {
      auth = await resetProvider(provider, messageToSign)
    } else {
      if (provider.enable) {
        try {
          await provider.enable()
        } catch {
          alert('Please, check your wallet and try again to connect.')
          return
        }
      }
      const ethersProvider = new ethers.providers.Web3Provider(provider)

      if (provider.on) {
        provider.on('accountsChanged', () => {
          resetProvider(
            new ethers.providers.Web3Provider(provider),
            messageToSign
          )
        })

        provider.on('chainChanged', () => {
          resetProvider(new ethers.providers.Web3Provider(provider))
        })
      }
      auth = await resetProvider(ethersProvider, messageToSign)
    }

    setLoading(false)
    return auth
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
    clearStorage()
    try {
      await provider.provider.close()
    } catch (error) {
      console.error(
        'We could not disconnect provider properly using provider.disconnect()'
      )
      console.error(error)
    }
    setProvider(null)
    setLoading(false)
  }

  const changeNetwork = async (network: any) => {
    if (provider.isUnlock) {
      const newProvider = UnlockProvider.reconnect(provider, network)
      resetProvider(newProvider)
    } else {
      try {
        await provider.send(
          'wallet_switchEthereumChain',
          [
            {
              chainId: `0x${network.id.toString(16)}`,
            },
          ],
          account
        )
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to the provider yet.
        if (switchError.code === 4902) {
          try {
            await provider.send(
              'wallet_addEthereumChain',
              [
                {
                  chainId: `0x${network.id.toString(16)}`,
                  chainName: network.name,
                  rpcUrls: [network.provider],
                  nativeCurrency: network.nativeCurrency,
                },
              ],
              account
            )
          } catch (addError) {
            window.alert(
              'Network could not be added. Please try manually adding it to your wallet'
            )
          }
        } else {
          window.alert(
            'Network could not be changed. Please change it from your wallet.'
          )
        }
      }
    }
  }

  return {
    loading,
    network,
    account,
    signedMessage,
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
