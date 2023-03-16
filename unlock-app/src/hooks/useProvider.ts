import { ethers } from 'ethers'
import { useState, useContext, useEffect } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'
import { useAddToNetwork } from './useAddToNetwork'
import ProviderContext from '../contexts/ProviderContext'
import UnlockProvider from '../services/unlockProvider'
import { useAppStorage } from './useAppStorage'
import { ToastHelper } from '../components/helpers/toast.helper'
import { signOut } from '~/config/storage'

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
  const [openConnectModal, setOpenConnectModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [walletService, setWalletService] = useState<any>()
  const [network, setNetwork] = useState<number | undefined>(undefined)
  const [account, setAccount] = useState<string | undefined>(undefined)
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [isUnlockAccount, setIsUnlockAccount] = useState<boolean>(false)
  const [encryptedPrivateKey, setEncryptedPrivateKey] = useState<
    any | undefined
  >(undefined)
  const { setStorage, clearStorage } = useAppStorage()
  const { addNetworkToWallet } = useAddToNetwork(account)

  useEffect(() => {
    if (account) {
      setStorage('account', account)
    }
    if (network) {
      setStorage('network', network)
    }
  }, [account, network, setStorage])

  const createWalletService = async (provider: any) => {
    const _walletService = new WalletService(config.networks)
    let _network = 1 // default
    try {
      _network = await _walletService.connect(provider)
    } catch (error) {
      console.log(error)
    }

    const _account = await _walletService.getAccount()
    return {
      walletService: _walletService,
      network: _network,
      account: _account,
    }
  }

  const switchWeb3ProviderNetwork = async (id: number) => {
    try {
      await provider.send(
        'wallet_switchEthereumChain',
        [
          {
            chainId: `0x${id.toString(16)}`,
          },
        ],
        account
      )
    } catch (switchError: any) {
      if (switchError.code === 4902 || switchError.code === -32603) {
        return addNetworkToWallet(id)
      } else {
        throw switchError
      }
    }
  }

  const getWalletService = async (networkId?: number) => {
    const currentNetworkId = Number(network)
    // If the user is not connected, we open the connect modal
    if (!isConnected) {
      setOpenConnectModal(true)
      return
    }
    let walletServiceProvider: ethers.providers.Provider = provider
    if (networkId && networkId !== currentNetworkId) {
      const networkConfig = config.networks[networkId]
      if (provider.isUnlock) {
        walletServiceProvider = UnlockProvider.reconnect(
          provider,
          networkConfig
        )
      } else {
        await switchWeb3ProviderNetwork(networkId)
        walletServiceProvider = new ethers.providers.Web3Provider(
          provider.provider,
          'any'
        )
      }
    }
    const { walletService: _walletService } = await createWalletService(
      walletServiceProvider
    )
    return _walletService
  }

  const resetProvider = async (provider: ethers.providers.Provider) => {
    try {
      setProvider(provider)
      const {
        network: _network,
        walletService: _walletService,
        account: _account,
      } = await createWalletService(provider)
      setNetwork(_network || undefined)

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
        // We actually do not care :D
        // The user will be promped to switch networks when they perform a transaction
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
    console.log(provider.enabled, 'test')
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
        provider.on('accountsChanged', async () => {
          resetProvider(new ethers.providers.Web3Provider(provider))
          await signOut()
        })

        provider.on('chainChanged', async () => {
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
      // unlock provider does not support removing listeners or closing.
      if (provider?.isUnlock) {
        return
      }
      provider.provider.removeAllListeners()
      // metamask does not support disconnect
      if (provider?.connection?.url !== 'metamask') {
        await provider.provider.close()
      }
    } catch (error) {
      console.error(
        'We could not disconnect provider properly using provider.disconnect()'
      )
      console.error(error)
    }
    setProvider(null)
    setLoading(false)
    await signOut()
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

  const providerSend = async (method: string, params: any) => {
    return await provider.send(method, params)
  }

  // For now, we use account as a proxy for isConnected
  const isConnected = !!account

  return {
    loading,
    network,
    account,
    email,
    getWalletService,
    isUnlockAccount,
    encryptedPrivateKey,
    walletService,
    connectProvider,
    disconnectProvider,
    watchAsset,
    providerSend,
    isConnected,
    openConnectModal,
    setOpenConnectModal,
  }
}
