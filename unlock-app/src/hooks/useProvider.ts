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
   * Ensures the connected wallet matches the authenticated account
   * Returns true if successful, false otherwise
   */
  const ensureCorrectWallet = async () => {
    if (!account) return true
    // Get current connected address
    const currentWalletAddress = wallets[0]?.address?.toLowerCase()
    const authenticatedAddress = account.toLowerCase()

    // If addresses match, we're good
    if (currentWalletAddress === authenticatedAddress) return true

    // If wallet not connected or wrong address, try to connect with the right one
    try {
      // Try to trigger wallet connection with the authenticated address
      await connectWallet({
        suggestedAddress: account!,
      })

      // Re-check if switch was successful
      const newWallet = wallets[0]
      const newWalletAddress = newWallet?.address?.toLowerCase()

      if (newWalletAddress === authenticatedAddress) {
        // If we've switched wallets, we need to update the provider
        if (newWallet && currentWalletAddress !== newWalletAddress) {
          const newProvider = await newWallet.getEthereumProvider()
          setProvider(createBrowserProvider(newProvider))
        }

        return true
      } else {
        // If still not matching, show error
        ToastHelper.error(`Please switch to address ${account} in your wallet.`)
        return false
      }
    } catch (error) {
      console.error('Error switching to authenticated wallet:', error)
      return false
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
      // Ensure the wallet matches the authenticated account before proceeding
      await ensureCorrectWallet()

      // Get the current network
      const network = await provider.getNetwork()
      const currentChainId = parseInt(network.chainId)

      console.debug(
        `Currently connected to network: ${currentChainId} and want ${networkId}`
      )

      // compare the networkId with the current chainId
      if (networkId && networkId !== currentChainId) {
        // Prompt user to switch to the requested network
        await switchProviderNetwork(networkId!)
        await new Promise((resolve, reject): void => {
          const start = new Date().getTime()
          const interval = setInterval(async () => {
            const network = await provider.getNetwork()
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

      // instantiate the wallet service with the current provider
      const { walletService: _walletService } =
        await createWalletService(provider)
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
    ensureCorrectWallet,
  }
}
