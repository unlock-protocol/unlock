'use client'

import { useLogin, usePrivy, useWallets } from '@privy-io/react-auth'
import { BrowserProvider } from 'ethers'
import { governanceConfig } from '~/config/governance'
import { governanceEnv } from '~/config/env'

function chainHex(chainId: number) {
  return `0x${chainId.toString(16)}`
}

export function useGovernanceWallet() {
  const { authenticated, ready: privyReady } = usePrivy()
  const { wallets, ready: walletsReady } = useWallets()
  const { login } = useLogin()
  const wallet = wallets[0] || null

  async function getBrowserProvider() {
    if (!wallet) {
      throw new Error('Connect a wallet to continue.')
    }

    const ethereumProvider = await wallet.getEthereumProvider()
    return new BrowserProvider(ethereumProvider, 'any')
  }

  async function ensureBaseNetwork() {
    const provider = await getBrowserProvider()
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
    canConnect: Boolean(governanceEnv.privyAppId),
    connect: login,
    getBrowserProvider,
    getSigner,
    isReady: privyReady && walletsReady,
    wallet,
  }
}
