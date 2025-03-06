import { useQueries } from '@tanstack/react-query'
import { Lock } from '~/unlockTypes'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { DEFAULT_USER_ACCOUNT_ADDRESS } from '~/constants'
import { ethers } from 'ethers'

export interface LockDetails {
  balance: string
  tokenSymbol: string
  keyPrice: string
}

/**
 * Hook to fetch details for multiple locks in a batch.
 * It now uses lock.tokenAddress and lock.price to match the original LockCard.
 *
 * @param locks Array of locks to fetch details for.
 * @param network Network ID (if not provided, lock.network is used).
 * @returns Object with lock details mapped by lock address.
 */
export const useLockDetails = (locks: Lock[] = [], network?: number | null) => {
  const web3Service = useWeb3Service()

  const lockDetailsQueries = useQueries({
    queries: locks.map((lock) => {
      // Use tokenAddress from the original LockCard rather than currencyContractAddress
      const tokenAddress = lock.tokenAddress || DEFAULT_USER_ACCOUNT_ADDRESS
      const lockAddress = lock.address
      const lockNetwork = network ? network : lock.network

      return {
        queryKey: ['lockDetails', lockAddress, lockNetwork, tokenAddress],
        queryFn: async () => {
          const [balance, tokenSymbol, keyPrice] = await Promise.all([
            web3Service.getAddressBalance(
              lockAddress,
              lockNetwork,
              tokenAddress === DEFAULT_USER_ACCOUNT_ADDRESS
                ? undefined
                : tokenAddress
            ),
            web3Service.getTokenSymbol(tokenAddress, lockNetwork),
            (async () => {
              const decimals = await web3Service.getTokenDecimals(
                tokenAddress,
                lockNetwork
              )
              // Use lock.price instead of lock.keyPrice so that we match the original logic.
              return ethers.formatUnits(lock.price, decimals)
            })(),
          ])

          return {
            balance,
            tokenSymbol,
            keyPrice,
          } as LockDetails
        },
        staleTime: 60 * 1000, // 1 minute
      }
    }),
  })

  // Map the responses to allow lookup by lock address.
  const lockDetailsMap = locks.reduce(
    (acc, lock, index) => {
      const query = lockDetailsQueries[index]
      acc[lock.address] = {
        isLoading: query.isLoading,
        data: query.data,
      }
      return acc
    },
    {} as Record<string, { isLoading: boolean; data?: LockDetails }>
  )

  return {
    lockDetailsMap,
    isLoading: lockDetailsQueries.some((query) => query.isLoading),
    isFetched: lockDetailsQueries.every((query) => query.isFetched),
  }
}
