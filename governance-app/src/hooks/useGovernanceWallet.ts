'use client'

import { useLogin, usePrivy, useWallets, useLogout } from '@privy-io/react-auth'
import { BrowserProvider } from 'ethers'
import { useRouter } from 'next/navigation'
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
  const wallet = wallets[0] || null

  async function ensureBaseNetwork() {
    if (!wallet) {
      throw new Error('Connect a wallet to continue.')
    }
    const ethereumProvider = await wallet.getEthereumProvider()
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
    authenticated,
    connect: login,
    disconnect: logout,
    getSigner,
    isReady: privyReady && walletsReady,
  }
}
