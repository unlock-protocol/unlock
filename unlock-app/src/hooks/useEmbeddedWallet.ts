import { usePrivy, useWallets } from '@privy-io/react-auth'

interface UseEmbeddedWalletReturn {
  isEmbeddedWallet: boolean
  isLoading: boolean
  walletAddress: string | null
}

/**
 * Custom hook to manage the state of an embedded wallet.
 *
 * This hook provides information about the user's embedded wallet status,
 * including whether the wallet is currently loading, the wallet address,
 * and if the wallet is an embedded Privy wallet.
 *
 */
export const useEmbeddedWallet = (): UseEmbeddedWalletReturn => {
  const { user, ready: privyReady } = usePrivy()
  const { wallets, ready: walletsReady } = useWallets()

  // Wait for both Privy and wallets to be ready
  const isLoading = !privyReady || !walletsReady

  // Get the most recently connected wallet address
  const walletAddress = wallets[0]?.address || null

  // Check if the current wallet is an embedded Privy wallet
  const isEmbeddedWallet = !!user?.linkedAccounts.find(
    (account) =>
      account.type === 'wallet' &&
      account.walletClientType === 'privy' &&
      account.address?.toLowerCase() === walletAddress?.toLowerCase()
  )

  return {
    isEmbeddedWallet,
    isLoading,
    walletAddress,
  }
}
