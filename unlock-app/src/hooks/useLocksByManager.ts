import { QueriesOptions, useQueries, useQuery } from '@tanstack/react-query'
import { LockOrderBy, OrderDirection } from '@unlock-protocol/unlock-js'
import { graphService } from '~/config/subgraph'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { ethers } from 'ethers'
import { useCallback, useMemo } from 'react'
import { DEFAULT_USER_ACCOUNT_ADDRESS } from '~/constants'

interface GetLocksParams {
  account: string
  networks: number[]
}

// Batch request for multiple networks
export const getLocksByNetworks = async ({
  account,
  networks,
}: GetLocksParams) => {
  try {
    return graphService.locks(
      {
        first: 1000,
        where: {
          lockManagers_contains: [account],
        },
        orderBy: LockOrderBy.CreatedAtBlock,
        orderDirection: OrderDirection.Desc,
      },
      {
        networks,
      }
    )
  } catch (error) {
    console.error('Failed to fetch locks:', error)
    return []
  }
}

// Legacy support wrapper to maintain backwards compatibility
export const getLocksByNetwork = async ({ account, network }: any) => {
  const results = await getLocksByNetworks({
    account,
    networks: [Number(network)],
  })
  return results
}

const useLocksByManagerOnNetworks = (
  manager: string,
  networkItems: [string, any][]
) => {
  const networks = networkItems.map(([network]) => Number(network))

  const query: QueriesOptions<any> = {
    queryKey: ['getLocks', networks.join(','), manager],
    queryFn: async () =>
      await getLocksByNetworks({
        account: manager,
        networks,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  }

  // Maintain backwards compatibility by wrapping the result in an array
  return useQueries({
    queries: [query],
  })
}

export interface EnhancedLock {
  address: string
  name: string
  network: number
  tokenAddress: string
  expirationDuration: string
  totalKeys: number
  price: string
  balance: string
  tokenSymbol: string
  formattedKeyPrice: string
  lockIcon: string
}

interface EnhancedLockData {
  locks: any[]
  enhanceLock: (lock: any, networkConfig: any) => Promise<EnhancedLock>
  networkItems: [string, any][]
}

export const useEnhancedLocksByManager = (
  manager: string,
  networkItems: [string, any][]
) => {
  const web3service = useWeb3Service()
  const networks = networkItems.map(([network]) => Number(network))

  // Add a simple cache to avoid duplicate requests
  const iconCache = useMemo(() => new Map<string, string>(), [])

  const enhanceLock = useCallback(
    async (lock: any, networkConfig: any): Promise<EnhancedLock> => {
      const { address, network, tokenAddress } = lock
      const baseCurrencySymbol = networkConfig?.nativeCurrency?.symbol

      // Check if we already have the icon in the cache
      const iconCacheKey = `${network}-${address}`
      const cachedIcon = iconCache.get(iconCacheKey)

      // Ensure we have a storage host, defaulting to main network if not available
      const storageHost =
        networkConfig?.services?.storage?.host ||
        'https://locksmith.unlock-protocol.com'

      try {
        // Fetch all details in parallel, but use cached icon if available
        const [balance, tokenSymbol, decimals, lockIcon] = await Promise.all([
          web3service.getAddressBalance(
            address,
            network,
            tokenAddress === DEFAULT_USER_ACCOUNT_ADDRESS
              ? undefined
              : tokenAddress
          ),
          web3service.getTokenSymbol(tokenAddress, network),
          web3service.getTokenDecimals(tokenAddress, network),
          // Use cached icon or fetch it
          cachedIcon
            ? Promise.resolve(cachedIcon)
            : fetch(
                `${storageHost}/lock/${address}/icon`,
                { method: 'GET', cache: 'force-cache' } // Add cache control
              )
                .then((res) => {
                  if (!res.ok) return '/images/svg/default-lock-logo.svg'
                  const iconUrl = `${storageHost}/lock/${address}/icon`
                  iconCache.set(iconCacheKey, iconUrl)
                  return iconUrl
                })
                .catch(() => {
                  const defaultIcon = '/images/svg/default-lock-logo.svg'
                  iconCache.set(iconCacheKey, defaultIcon)
                  return defaultIcon
                }),
        ])

        const formattedKeyPrice = ethers.formatUnits(
          lock?.price || '0',
          decimals
        )
        const symbol = tokenSymbol ?? baseCurrencySymbol

        return {
          ...lock,
          balance,
          tokenSymbol: symbol,
          formattedKeyPrice,
          lockIcon,
        }
      } catch (error) {
        console.error(`Error enhancing lock ${address}:`, error)
        return {
          ...lock,
          balance: '0',
          tokenSymbol: baseCurrencySymbol,
          formattedKeyPrice: '0',
          lockIcon: '/images/svg/default-lock-logo.svg',
        }
      }
    },
    [web3service, iconCache]
  )

  return useQuery<EnhancedLockData>({
    queryKey: ['getEnhancedLocks', networks.join(','), manager],
    queryFn: async (): Promise<EnhancedLockData> => {
      const locks = await getLocksByNetworks({
        account: manager,
        networks,
      })

      // Return data without processing locks here
      // This will prevent unnecessary processing in the query function
      return {
        locks,
        enhanceLock,
        networkItems,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (was cacheTime in React Query v3)
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

export default useLocksByManagerOnNetworks
