import { useContext, useEffect, useState } from 'react'
import { ProviderContext } from '../contexts/ProviderContext'
import { config as AppConfig } from '../config/app'
export const useAddToNetwork = (account?: string | null) => {
  const { provider } = useContext(ProviderContext)
  const [currentNetwork, setCurrentNetwork] = useState<number | null>()

  useEffect(() => {
    if (!provider) return
    setCurrentNetwork(provider?.network?.chainId)
  }, [])

  const getCurrentNetwork = (network: number) => {
    if (!network) return
    const currentNetwork = AppConfig.networks[network]
    if (!currentNetwork) return
    return currentNetwork
  }

  const addNetworkToWallet = async (networkId: number) => {
    const {
      id,
      name: chainName,
      publicProvider,
      nativeCurrency,
      explorer,
    } = getCurrentNetwork(networkId) as any

    const params = {
      chainId: `0x${id.toString(16)}`,
      rpcUrls: [publicProvider],
      chainName,
      nativeCurrency,
      blockExplorerUrls: [explorer.urls.base],
    }

    return provider.send('wallet_addEthereumChain', [params], account)
  }

  return {
    addNetworkToWallet,
    currentNetwork,
  }
}
