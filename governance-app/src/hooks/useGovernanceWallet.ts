'use client'

import { useLogin, usePrivy, useWallets, useLogout } from '@privy-io/react-auth'
import { BrowserProvider } from 'ethers'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { governanceConfig } from '~/config/governance'

function chainHex(chainId: number) {
  return `0x${chainId.toString(16)}`
}

export function useGovernanceWallet() {
  const { authenticated, ready: privyReady } = usePrivy()
  const { wallets, ready: walletsReady } = useWallets()
  const { login } = useLogin()
  const router = useRouter()
  const { logout } = useLogout({
    onSuccess: () => router.refresh(),
  })
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const wallet =
    wallets.find((candidate) => candidate.address === selectedAddress) ||
    (wallets.length === 1 ? wallets[0] : null)

  function selectWallet(address: string) {
    setSelectedAddress(address)
  }

  async function getProvider() {
    if (!wallet) throw new Error('Choose an external wallet to continue.')
    return wallet.getEthereumProvider()
  }

  async function ensureBaseNetwork() {
    if (!wallet) {
      throw new Error('Connect a wallet to continue.')
    }
    const ethereumProvider = await getProvider()
    const provider = new BrowserProvider(ethereumProvider, 'any')
    const network = await provider.getNetwork()

    if (Number(network.chainId) === governanceConfig.chainId) {
      return provider
    }

    try {
      await provider.send('wallet_switchEthereumChain', [
        {
          chainId: chainHex(governanceConfig.chainId),
        },
      ])
    } catch {
      throw new Error('Please switch your wallet to Base to continue.')
    }

    return provider
  }

  async function getSigner() {
    const provider = await ensureBaseNetwork()
    return provider.getSigner()
  }

  return {
    address: wallet?.address || null,
    wallets,
    selectedWallet: wallet,
    selectWallet,
    getProvider,
    authenticated,
    connect: login,
    disconnect: logout,
    getSigner,
    isReady: privyReady && walletsReady,
  }
}
