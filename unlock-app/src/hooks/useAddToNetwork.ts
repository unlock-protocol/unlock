import { toast } from 'react-hot-toast'
import { useContext, useEffect, useState } from 'react'
import { ProviderContext } from '../contexts/ProviderContext'
import { ConfigContext } from '../utils/withConfig'

export const useAddToNetwork = (account?: string) => {
  const { networks } = useContext(ConfigContext)
  const { provider } = useContext(ProviderContext)
  const [currentNetwork, setCurrentNetwork] = useState<number | null>()

  useEffect(() => {
    if (!provider) return
    setCurrentNetwork(provider.network.chainId)
  }, [])

  const getCurrentNetwork = (network: number) => {
    if (!network) return
    const currentNetwork = networks[network]
    if (!currentNetwork) return
    return currentNetwork
  }

  const addNetworkToWallet = async (networkId: number) => {
    const {
      id,
      name: chainName,
      publicProvider,
      nativeCurrency,
    } = getCurrentNetwork(networkId) as any

    const params = {
      chainId: `0x${id.toString(16)}`,
      rpcUrls: [publicProvider],
      chainName,
      nativeCurrency,
    }

    try {
      await await toast.promise(
        provider.send('wallet_addEthereumChain', [params], account),
        {
          loading: `Changing network to ${chainName}. Please Approve on your wallet.`,
          error: `Error in changing network to ${chainName}`,
          success: `Successfully changed network to ${chainName}`,
        }
      )
    } catch (err) {
      toast.error(`Error in changing network to ${chainName}`)
    }
  }

  return {
    addNetworkToWallet,
    currentNetwork,
  }
}
