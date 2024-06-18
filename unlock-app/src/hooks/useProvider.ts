import { ethers } from 'ethers'
import { useState, useContext } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'
import { useAddToNetwork } from './useAddToNetwork'
import ProviderContext from '../contexts/ProviderContext'
import UnlockProvider from '../services/unlockProvider'
import { useAppStorage } from './useAppStorage'
import { ToastHelper } from '../components/helpers/toast.helper'
import { useSession } from './useSession'
import { getCurrentNetwork } from '~/utils/session'
import { useConnectModal } from './useConnectModal'

export interface EthereumWindow extends Window {
  web3: any
  ethereum: any
}

interface WatchAssetInterface {
  address: string
  network: number
  tokenId: string
}

/**
 * Initializes a provider passed
 * @param providerAdapter
 */
export const useProvider = (config: any) => {
  const { setProvider, provider } = useContext(ProviderContext)
  const { openConnectModalAsync, closeConnectModal } = useConnectModal()
  const [loading, setLoading] = useState(false)
  const [walletService, setWalletService] = useState<any>()
  const [network, setNetwork] = useState<number | undefined>(
    getCurrentNetwork() || 1
  )
  const [connected, setConnected] = useState<string | undefined>()
  const { setStorage, clearStorage, getStorage } = useAppStorage()
  const { addNetworkToWallet } = useAddToNetwork(connected)
  const { session: account, refetchSession } = useSession()

  const isUnlockAccount =
    !!provider?.isUnlock || (!provider && getStorage('provider') === 'UNLOCK')
  const email = provider?.emailAddress || getStorage('email')
  const encryptedPrivateKey = provider?.passwordEncryptedPrivateKey

  const createWalletService = async (provider: any) => {
    const _walletService = new WalletService(config.networks)
    const _network = await _walletService.connect(provider)
    const _account = await _walletService.getAccount()
    return {
      walletService: _walletService,
      provider,
      network: _network,
      account: _account,
    }
  }

  const displayAccount = email || connected

  const switchBrowserProviderNetwork = async (id: number) => {
    try {
      await provider.send(
        'wallet_switchEthereumChain',
        [
          {
            chainId: `0x${id.toString(16)}`,
          },
        ],
        connected
      )
    } catch (switchError: any) {
      if (switchError.code === 4902 || switchError.code === -32603) {
        return addNetworkToWallet(id)
      } else {
        throw switchError
      }
    }
  }

  const getNetworkProvider = async (networkId?: number) => {
    const currentNetworkId = Number(network)
    let pr = provider
    // If the user is not connected, we open the connect modal
    if (!connected) {
      const response = await openConnectModalAsync()
      await closeConnectModal()
      pr = response?.provider
    }
    let walletServiceProvider: ethers.BrowserProvider = pr
    if (networkId && networkId !== currentNetworkId) {
      const networkConfig = config.networks[networkId]
      if (pr.isUnlock) {
        walletServiceProvider = (await UnlockProvider.reconnect(
          pr,
          networkConfig
        )) as unknown as ethers.BrowserProvider
      } else {
        await switchBrowserProviderNetwork(networkId)
        walletServiceProvider = new ethers.BrowserProvider(window.ethereum!)
      }
    }
    return walletServiceProvider
  }

  const getWalletService = async (networkId?: number) => {
    const networkProvider = await getNetworkProvider(networkId)
    const { walletService: _walletService } =
      await createWalletService(networkProvider)
    return _walletService
  }

  const resetProvider = async (provider: ethers.AbstractProvider) => {
    try {
      setProvider(provider)
      const {
        network: _network,
        walletService: _walletService,
        account: _account,
      } = await createWalletService(provider)

      setWalletService(_walletService)

      if (_account) {
        setStorage('account', _account)
      }

      if (_network) {
        setStorage('network', _network)
      }

      await refetchSession()

      setNetwork(_network || undefined)
      setConnected(_account || undefined)

      return {
        email,
        provider,
        passwordEncryptedPrivateKey: encryptedPrivateKey,
        isUnlock: isUnlockAccount,
        walletService: _walletService,
        network: _network,
        account: _account,
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
    if (provider instanceof ethers.AbstractProvider) {
      auth = await resetProvider(provider)
    } else {
      if (provider.enable) {
        try {
          await provider.enable()
        } catch {
          console.error('Please check your wallet and try again to connect.')
          setLoading(false)
          return
        }
      }
      const ethersProvider = new ethers.BrowserProvider(provider)

      if (provider.on) {
        provider.on('accountsChanged', async () => {
          await resetProvider(new ethers.BrowserProvider(provider))
        })

        provider.on('chainChanged', async () => {
          await resetProvider(new ethers.BrowserProvider(provider))
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
    setConnected(undefined)

    clearStorage(
      ['provider', 'network', 'account', `$session_${account}`, 'email'],
      true
    )
    try {
      // unlock provider does not support removing listeners or closing.
      if (provider && !provider?.isUnlock) {
        provider.provider.removeAllListeners()
        // metamask does not support disconnect
        if (provider?.connection?.url !== 'metamask') {
          await provider.provider.close()
        }
      }
    } catch (error) {
      console.error(
        'We could not disconnect provider properly using provider.disconnect()'
      )
      console.error(error)
    }
    setProvider(null)
    setLoading(false)
  }

  // More info https://docs.metamask.io/wallet/reference/wallet_watchasset/
  const watchAsset = async ({
    address,
    network,
    tokenId,
  }: WatchAssetInterface) => {
    await switchBrowserProviderNetwork(network)
    await provider.send('wallet_watchAsset', {
      type: 'ERC721',
      options: {
        address,
        tokenId,
      },
    })
  }

  const providerSend = async (method: string, params: any) => {
    return await provider.send(method, params)
  }

  return {
    loading,
    network,
    account: provider ? account : undefined,
    email,
    getWalletService,
    isUnlockAccount,
    encryptedPrivateKey,
    walletService,
    connectProvider,
    disconnectProvider,
    watchAsset,
    providerSend,
    connected,
    provider,
    displayAccount,
  }
}
