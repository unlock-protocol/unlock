import { useContext } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'
import ProviderContext from '../contexts/ProviderContext'
import { ToastHelper } from '../components/helpers/toast.helper'
import { useSession } from './useSession'
import { config } from '~/config/app'
import { ethers } from 'ethers'
import networks from '@unlock-protocol/networks'

interface WatchAssetInterface {
  address: string
  network: number
  tokenId: string
}

export const useProvider = () => {
  const { setProvider, provider } = useContext(ProviderContext)
  const { session: account } = useSession()

  const createBrowserProvider = (
    provider: any
  ): ethers.BrowserProvider | null => {
    if (!provider) {
      return null
    }
    const browserProvider = new ethers.BrowserProvider(provider, 'any')
    if (provider.parentOrigin) {
      // @ts-expect-error Property 'parentOrigin' does not exist on type 'BrowserProvider'.
      browserProvider.parentOrigin = provider.parentOrigin
    }
    return browserProvider
  }

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

  const addNetworkToWallet = async (networkId: number) => {
    const {
      id,
      name: chainName,
      publicProvider,
      nativeCurrency,
      explorer,
    } = networks[networkId] as any

    const params = {
      chainId: `0x${id.toString(16)}`,
      rpcUrls: [publicProvider],
      chainName,
      nativeCurrency,
      blockExplorerUrls: [explorer.urls.base],
    }

    return provider.send('wallet_addEthereumChain', [params], account)
  }

  const switchProviderNetwork = async (id: number) => {
    try {
      await provider.send('wallet_switchEthereumChain', [
        {
          chainId: `0x${id.toString(16)}`,
        },
      ])
    } catch (switchError: any) {
      if (switchError.code === 4902 || switchError.code === -32603) {
        return addNetworkToWallet(id)
      } else {
        console.error('There was an error switching networks:', switchError)
        throw switchError
      }
    }
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
    if (!provider) {
      ToastHelper.error('Please make sure your wallet is connected.')
      throw new Error('Wallet not connected!')
    }
    try {
      // Get the current network
      const network = await provider.getNetwork()
      const currentChainId = network.chainId

      // compare the networkId with the current chainId
      if (networkId && networkId !== currentChainId) {
        // Prompt user to switch to the requested network
        await switchProviderNetwork(networkId)
        // Add a 1 second delay after switching provider network
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // instantiate the wallet service with the current provider
      const { walletService: _walletService } =
        await createWalletService(provider)
      return _walletService
    } catch (error: any) {
      ToastHelper.error(`Error while getting wallet service: ${error}`)
      console.error('Error in getWalletService:', error)
      throw error
    }
  }

  // More info https://docs.metamask.io/wallet/reference/wallet_watchasset/
  const watchAsset = async ({
    address,
    network,
    tokenId,
  }: WatchAssetInterface) => {
    await switchProviderNetwork(network)
    await provider.send('wallet_watchAsset', {
      type: 'ERC721',
      options: {
        address,
        tokenId,
      },
    })
  }

  return {
    getWalletService,
    setProvider: (provider: any) => {
      setProvider(createBrowserProvider(provider))
    },
    account: provider ? account : undefined,
    watchAsset,
    provider,
  }
}
