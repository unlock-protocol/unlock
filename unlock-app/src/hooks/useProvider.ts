import { useContext } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'
import ProviderContext from '../contexts/ProviderContext'
import { ToastHelper } from '@unlock-protocol/ui'
import { config } from '~/config/app'
import { ethers } from 'ethers'
import networks from '@unlock-protocol/networks'
import AuthenticationContext from '~/contexts/AuthenticationContext'
import { useConnectWallet, useWallets } from '@privy-io/react-auth'

interface WatchAssetInterface {
  address: string
  network: number
  tokenId: string
}

interface ProviderWithSend {
  send?: (method: string, params: unknown[]) => Promise<unknown>
}

export const useProvider = () => {
  const { setProvider, provider } = useContext(ProviderContext)
  const { account } = useContext(AuthenticationContext)
  const { wallets } = useWallets()

  const { connectWallet } = useConnectWallet()

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

  const addNetworkToWallet = async (
    networkId: number,
    targetProvider = provider
  ) => {
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

    return targetProvider.send('wallet_addEthereumChain', [params], account)
  }

  const switchProviderNetwork = async (
    id: number,
    targetProvider = provider
  ) => {
    try {
      await targetProvider.send('wallet_switchEthereumChain', [
        {
          chainId: `0x${id.toString(16)}`,
        },
      ])
    } catch (switchError: any) {
      if (switchError.code === 4902 || switchError.code === -32603) {
        return addNetworkToWallet(id, targetProvider)
      } else {
        console.error('There was an error switching networks:', switchError)
        throw switchError
      }
    }
  }

  const getProviderAccount = async (targetProvider?: ProviderWithSend) => {
    try {
      const accounts = await targetProvider?.send?.('eth_accounts', [])
      if (!Array.isArray(accounts) || typeof accounts[0] !== 'string') {
        return undefined
      }
      return accounts[0].toLowerCase()
    } catch {
      return undefined
    }
  }

  /**
   * Resolves the provider belonging to the authenticated account, prompting
   * the user to connect it if it is not already available.
   *
   * Returns `null` when the authenticated wallet could not be connected, so
   * callers must not fall back to the ambient provider: it may well be signing
   * from a different address than the one the UI shows as connected.
   */
  const resolveAuthenticatedProvider = async () => {
    // Delegated providers are owned by the checkout's parent page. They may
    // authenticate through SIWE without exposing a wallet through Privy.
    if (!account || provider?.parentOrigin) return provider

    const authenticatedAddress = account.toLowerCase()

    // Reuse the context provider when its default signer already matches.
    // WalletService also uses signer index 0, so checking that same account
    // avoids replacing the provider and re-rendering the application tree.
    if ((await getProviderAccount(provider)) === authenticatedAddress) {
      return provider
    }

    // Privy exposes every connected wallet and makes no promise about their
    // order, so the authenticated one has to be looked up by address.
    const wallet = wallets.find(
      (w) => w.address?.toLowerCase() === authenticatedAddress
    )

    if (!wallet || typeof wallet.getEthereumProvider !== 'function') {
      // Open the connect modal so the user can switch, but do not wait on it.
      // `connectWallet` resolves nothing, and `wallets` is captured at render
      // time, so re-reading it here would only ever report the pre-switch
      // state. The user retries once connected, by which point this hook has
      // re-rendered with the new wallet.
      connectWallet({ suggestedAddress: account })
      return null
    }

    const browserProvider = createBrowserProvider(
      await wallet.getEthereumProvider()
    )

    // Keep the context in sync for later renders. The returned value is what
    // this call must use: `provider` from context is captured at render time
    // and will still hold the previous wallet for the rest of this call.
    if (browserProvider) {
      setProvider(browserProvider)
    }

    return browserProvider
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
      // Ensure the wallet matches the authenticated account before proceeding.
      // Signing with a different address than the UI reports produces failures
      // that surface as unrelated contract reverts, so this must be fatal.
      const activeProvider = await resolveAuthenticatedProvider()
      if (!activeProvider) {
        throw new Error(
          `Wrong wallet connected. Please switch to ${account} in your wallet and try again.`
        )
      }

      // Get the current network
      const network = await activeProvider.getNetwork()
      const currentChainId = parseInt(network.chainId)

      console.debug(
        `Currently connected to network: ${currentChainId} and want ${networkId}`
      )

      // compare the networkId with the current chainId
      if (networkId && networkId !== currentChainId) {
        // Prompt user to switch to the requested network
        await switchProviderNetwork(networkId!, activeProvider)
        await new Promise((resolve, reject): void => {
          const start = new Date().getTime()
          const interval = setInterval(async () => {
            const network = await activeProvider.getNetwork()
            const currentChainId = parseInt(network.chainId)
            console.debug(
              `Currently connected to network: ${currentChainId} and want ${networkId!}`
            )
            if (networkId === currentChainId) {
              clearInterval(interval)
              resolve(true)
            } else if (new Date().getTime() - start > 10000) {
              clearInterval(interval)
              reject(
                new Error(
                  `Network switch timed out: please switch your wallet's network manually to ${networkId}.`
                )
              )
            }
          }, 500)
        })
      }

      // instantiate the wallet service with the authenticated account's provider
      const { walletService: _walletService } =
        await createWalletService(activeProvider)
      return _walletService
    } catch (error: any) {
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
    const activeProvider = await resolveAuthenticatedProvider()
    if (!activeProvider) return

    await switchProviderNetwork(network, activeProvider)
    await activeProvider.send('wallet_watchAsset', {
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
