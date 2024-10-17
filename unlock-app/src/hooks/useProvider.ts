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
import { useWallets } from '@privy-io/react-auth'

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
  const [eip1193, setEip1193] = useState<any | undefined>()
  const { setStorage, clearStorage, getStorage } = useAppStorage()
  const { addNetworkToWallet } = useAddToNetwork(connected)
  const { session: account, refetchSession } = useSession()
  const { wallets } = useWallets()

  const isUnlockAccount =
    !!provider?.isUnlock || (!provider && getStorage('provider') === 'UNLOCK')
  const email = provider?.emailAddress || getStorage('email')
  const encryptedPrivateKey = provider?.passwordEncryptedPrivateKey

  /**
   * Initializes a `WalletService` instance with the provided provider.
   * This helps setup the connection to the blockchain
   * and retrieving essential information like the network and account.
   *
   * @param provider - The Ethereum provider to connect with
   * @returns An object containing the initialized WalletService, provider, network, and account
   *
   */
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

  const createBrowserProvider = (provider: any): ethers.BrowserProvider => {
    const browserProvider = new ethers.BrowserProvider(provider)
    if (provider.parentOrigin) {
      // @ts-expect-error Property 'parentOrigin' does not exist on type 'BrowserProvider'.
      browserProvider.parentOrigin = provider.parentOrigin
    }
    return browserProvider
  }

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
    let existingBrowserProvider = provider
    // If the user is not connected, we open the connect modal
    if (!connected) {
      const response = await openConnectModalAsync()
      await closeConnectModal()
      existingBrowserProvider = response?.provider
    }
    let walletServiceProvider: ethers.BrowserProvider = existingBrowserProvider
    if (networkId && networkId !== currentNetworkId) {
      const networkConfig = config.networks[networkId]
      if (existingBrowserProvider.isUnlock) {
        walletServiceProvider = (await UnlockProvider.reconnect(
          existingBrowserProvider,
          networkConfig
        )) as unknown as ethers.BrowserProvider
      } else {
        await switchBrowserProviderNetwork(networkId)
        if (getStorage('provider') === 'WALLET_CONNECT') {
          walletServiceProvider = createBrowserProvider(eip1193)
        } else {
          walletServiceProvider = createBrowserProvider(window.ethereum!)
        }
      }
    }
    return walletServiceProvider
  }
  /**
   * Retrieves or initializes a `WalletService` for a specific network.
   * It does the following:
   * 1. Retrieves the current Ethereum provider from the wallet.
   * 2. Checks the current network and compares it with the requested network.
   * 3. If necessary, prompts the user to switch to the requested network.
   * 4. Creates and returns a `WalletService` instance for the appropriate network.
   *
   * @param networkId - Optional network ID to connect to. If not provided, uses the current network.
   * @returns An initialized `WalletService` instance for the specified or current network.
   * @throws an error if there's an issue during the process, such as failed network switching.
   */
  const getWalletService = async (networkId?: number) => {
    try {
      const provider = await wallets[0].getEthersProvider()

      // Get the current network
      const network = await provider.getNetwork()
      const currentChainId = network.chainId

      // compare the networkId with the current chainId
      if (networkId && networkId !== currentChainId) {
        // Prompt user to switch to the requested network
        await wallets[0].switchChain(networkId)

        // After switching, get the updated provider
        const updatedProvider = await wallets[0].getEthersProvider()

        // instantiate the wallet service with the updated provider
        const { walletService: _walletService } =
          await createWalletService(updatedProvider)
        return _walletService
      }

      // if no network switch was needed, instantiate the wallet service with the current provider
      const { walletService: _walletService } =
        await createWalletService(provider)
      return _walletService
    } catch (error: any) {
      ToastHelper.error(`Error while getting wallet service: ${error}`)
      console.error('Error in getWalletService:', error)
      throw error
    }
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

  const connectProvider = async (eip1193Provider: any) => {
    setLoading(true)
    setEip1193(eip1193Provider)
    let auth
    if (eip1193Provider instanceof ethers.AbstractProvider) {
      auth = await resetProvider(eip1193Provider)
    } else {
      if (eip1193Provider.enable) {
        try {
          await eip1193Provider.enable()
        } catch {
          console.error('Please check your wallet and try again to connect.')
          setLoading(false)
          return
        }
      }

      if (eip1193Provider.on) {
        eip1193Provider.on('accountsChanged', async () => {
          await resetProvider(createBrowserProvider(eip1193Provider))
        })

        eip1193Provider.on('chainChanged', async () => {
          await resetProvider(createBrowserProvider(eip1193Provider))
        })
      }

      auth = await resetProvider(createBrowserProvider(eip1193Provider))
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
      if (provider && provider?.isWaas) {
        localStorage.removeItem('nextAuthProvider')
        await provider.disconnect()
      }
      // unlock provider does not support removing listeners or closing.
      else if (provider && !provider?.isUnlock) {
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
