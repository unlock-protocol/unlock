import { ethers } from 'ethers'
import { useState, useContext, useEffect } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'
import { useAddToNetwork } from './useAddToNetwork'
import ProviderContext from '../contexts/ProviderContext'
import UnlockProvider from '../services/unlockProvider'
import { useAppStorage } from './useAppStorage'
import { ToastHelper } from '../components/helpers/toast.helper'

export interface EthereumWindow extends Window {
  web3: any
  ethereum: any
}

interface WatchAssetInterface {
  address: string
  symbol: string
  image: string
}

/**
 * Initializes a provider passed
 * @param providerAdapter
 */
export const useProvider = (config: any) => {
  const { setProvider, provider } = useContext(ProviderContext)
  const [loading, setLoading] = useState(false)
  const [walletService, setWalletService] = useState<any>()
  const [network, setNetwork] = useState<string | undefined>(undefined)
  const [account, setAccount] = useState<string | undefined>(undefined)
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [isUnlockAccount, setIsUnlockAccount] = useState<boolean>(false)
  const [encryptedPrivateKey, setEncryptedPrivateKey] = useState<
    any | undefined
  >(undefined)
  const { getStorage, setStorage, clearStorage, removeKey } = useAppStorage()
  const { addNetworkToWallet } = useAddToNetwork(account)

  useEffect(() => {
    if (!getStorage('account') && account) {
      setStorage('account', account)
    }

    if (!getStorage('network') && network) {
      setStorage('network', network)
    }
  }, [account, network])

  const removeAccessToken = () => {
    removeKey('token', true)
  }

  const resetProvider = async (provider: ethers.providers.Provider) => {
    try {
      removeAccessToken()
      const _walletService = new WalletService(config.networks)
      setProvider(provider)
      // @ts-expect-error TODO fix walletService signature
      const _network = await _walletService.connect(provider)
      setNetwork(_network || undefined)

      const _account = await _walletService.getAccount()
      setWalletService(_walletService)
      // @ts-expect-error
      if (!provider.isUnlock) {
        setIsUnlockAccount(false)
        setEmail(undefined)
        setEncryptedPrivateKey(null)
        // Doing this last because usually consuming components will change their behavior based on it
        setAccount(_account || undefined)
        return {
          network: _network,
          account: _account,
        }
      }
      setIsUnlockAccount(true)
      // @ts-expect-error
      setEmail(provider.emailAddress)
      // @ts-expect-error
      setEncryptedPrivateKey(provider.passwordEncryptedPrivateKey)
      // Doing this last because usually consuming components will change their behavior based on it
      setAccount(_account || undefined)
      return {
        network: _network,
        account: _account,
        isUnlock: true,
        // @ts-expect-error
        email: provider.emailAddress,
        // @ts-expect-error
        passwordEncryptedPrivateKey: provider.passwordEncryptedPrivateKey,
      }
    } catch (error: any) {
      if (error.message.startsWith('Missing config')) {
        ToastHelper.error(
          `Unlock is currently not deployed on this network. Please switch network and refresh the page: ${error.message}`
        )
      } else if (error.message.includes('could not detect network')) {
        ToastHelper.error(
          'We could not detect the network to which your wallet is connected. Please try another wallet. (This issue happens often with the Frame Wallet)' // TODO: remove when Frame is fixed
        )
      } else {
        ToastHelper.error(error.message)
      }
      setProvider(null)
      console.error(error)
      return {}
    }
  }

  const connectProvider = async (provider: any) => {
    setLoading(true)
    let auth
    if (provider instanceof ethers.providers.Provider) {
      auth = await resetProvider(provider)
    } else {
      if (provider.enable) {
        try {
          await provider.enable()
        } catch {
          console.error('Please check your wallet and try again to connect.')
        }
      }
      const ethersProvider = new ethers.providers.Web3Provider(provider)

      if (provider.on) {
        provider.on('accountsChanged', () => {
          resetProvider(new ethers.providers.Web3Provider(provider))
        })

        provider.on('chainChanged', () => {
          resetProvider(new ethers.providers.Web3Provider(provider))
        })
      }
      auth = await resetProvider(ethersProvider)
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
      provider.provider.removeAllListeners()
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
        await ToastHelper.promise(
          provider.send(
            'wallet_switchEthereumChain',
            [
              {
                chainId: `0x${network.id.toString(16)}`,
              },
            ],
            account
          ),
          {
            loading: `Changing network to ${network.name}. Please Approve on your wallet.`,
            error: `Error in changing network to ${network.name}`,
            success: `Successfully changed network to ${network.name}`,
          }
        )
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to the provider yet.
        if (switchError.code === 4902) {
          try {
            await addNetworkToWallet(network.id)
          } catch (addError) {
            ToastHelper.error(
              'Network could not be added. Please try manually adding it to your wallet'
            )
          }
        }
      }
    }
  }

  const watchAsset = async ({
    address,
    symbol,
    image,
  }: WatchAssetInterface) => {
    await provider.send('wallet_watchAsset', {
      type: 'ERC20', // THIS IS A LIE, BUT AT LEAST WE CAN GET ADDED THERE!
      options: {
        address,
        symbol,
        decimals: 0,
        image,
      },
    })
  }

  const signMessage = async (messageToSign: string) => {
    return ToastHelper.promise(
      walletService.signMessage(messageToSign, 'personal_sign'),
      {
        loading: 'Please sign the message from your wallet',
        success: 'Successfully signed the message',
        error: 'There was an error in signing the message',
      }
    )
  }

  return {
    loading,
    network,
    account,
    signMessage,
    email,
    isUnlockAccount,
    encryptedPrivateKey,
    walletService,
    connectProvider,
    disconnectProvider,
    watchAsset,
    changeNetwork,
  }
}
