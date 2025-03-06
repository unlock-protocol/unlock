import { useQuery, useQueries } from '@tanstack/react-query'
import { Lock } from '~/unlockTypes'
import { PaywallLocksConfigType } from '@unlock-protocol/core'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { ethers } from 'ethers'

interface Options {
  lockAddress: string
  network: number
}

export const useLockData = ({ lockAddress, network }: Options) => {
  const web3Service = useWeb3Service()

  const { data: lock, isPending: isLockLoading } = useQuery({
    queryKey: ['lock', lockAddress, network],
    queryFn: async () => {
      const result = await web3Service.getLock(lockAddress, network)
      return {
        ...result,
        network,
      }
    },
    refetchInterval: false,
  })
  return {
    lock,
    isLockLoading,
  }
}

export const useMultipleLockData = (locks: PaywallLocksConfigType) => {
  const web3Service = useWeb3Service()
  const results = useQueries({
    queries: Object.keys(locks).map((lockAddress: string) => {
      const network = locks[lockAddress].network
      return {
        queryKey: ['lock', lockAddress, network],
        queryFn: async () => {
          return web3Service.getLock(lockAddress, network!) as Promise<Lock>
        },
      }
    }),
  })
  return results.map((result) => {
    return {
      lock: result.data,
      isLockLoading: result.isPending,
    }
  })
}

export const useComprehensiveLockData = ({ lockAddress, network }: Options) => {
  const { lock, isLockLoading } = useLockData({ lockAddress, network })
  const web3Service = useWeb3Service()

  const results = useQueries({
    queries: [
      {
        queryKey: ['getBalance', lockAddress, network, lock?.tokenAddress],
        queryFn: async () => {
          if (!lock || !lock.tokenAddress) return null
          return await web3Service.getAddressBalance(
            lock.address,
            network,
            lock.tokenAddress
          )
        },
        enabled: !!lock,
      },
      {
        queryKey: ['getSymbol', lockAddress, network, lock?.tokenAddress],
        queryFn: async () => {
          if (!lock || !lock.tokenAddress) return null
          return await web3Service.getTokenSymbol(lock.tokenAddress, network)
        },
        enabled: !!lock,
      },
      {
        queryKey: [
          'getKeyPrice',
          lockAddress,
          network,
          lock?.tokenAddress,
          lock?.price,
        ],
        queryFn: async () => {
          if (!lock || !lock.tokenAddress || lock.price === undefined)
            return null
          const decimals = await web3Service.getTokenDecimals(
            lock.tokenAddress,
            network
          )
          return ethers.formatUnits(lock.price, decimals)
        },
        enabled: !!lock,
      },
    ],
  })

  const [balanceQuery, symbolQuery, keyPriceQuery] = results

  const enhancedLock = lock
    ? {
        ...lock,
        balance: balanceQuery.data,
        tokenSymbol: symbolQuery.data,
        keyPrice: keyPriceQuery.data,
      }
    : null

  return {
    lock: enhancedLock,
    isLockLoading,
  }
}

interface MultipleOptions {
  locks: Array<{
    lockAddress: string
    network: number
  }>
}

export const useMultipleComprehensiveLockData = ({
  locks,
}: MultipleOptions) => {
  const web3Service = useWeb3Service()

  // First fetch all basic lock data
  const lockQueries = useQueries({
    queries: locks.map(({ lockAddress, network }) => ({
      queryKey: ['lock', lockAddress, network],
      queryFn: async () => {
        const result = await web3Service.getLock(lockAddress, network)
        return {
          ...result,
          network,
        }
      },
      refetchInterval: false as const,
    })),
  })

  // Then fetch all additional data for each lock
  const enhancementQueries = useQueries({
    queries: lockQueries.flatMap((lockQuery, index) => {
      const lock = lockQuery.data || {}
      const { lockAddress, network } = locks[index]

      if (!lockQuery.data) {
        return []
      }

      return [
        {
          queryKey: [
            'getBalance',
            lockAddress,
            network,
            lockQuery.data?.tokenAddress,
          ],
          queryFn: async () => {
            if (!lockQuery.data?.tokenAddress) return null
            return await web3Service.getAddressBalance(
              lockQuery.data.address,
              network,
              lockQuery.data.tokenAddress
            )
          },
          enabled: !!lockQuery.data,
        },
        {
          queryKey: [
            'getSymbol',
            lockAddress,
            network,
            lockQuery.data?.tokenAddress,
          ],
          queryFn: async () => {
            if (!lockQuery.data?.tokenAddress) return null
            return await web3Service.getTokenSymbol(
              lockQuery.data.tokenAddress,
              network
            )
          },
          enabled: !!lockQuery.data,
        },
        {
          queryKey: [
            'getKeyPrice',
            lockAddress,
            network,
            lockQuery.data?.tokenAddress,
            lockQuery.data?.price,
          ],
          queryFn: async () => {
            if (
              !lockQuery.data?.tokenAddress ||
              lockQuery.data?.price === undefined
            )
              return null
            const decimals = await web3Service.getTokenDecimals(
              lockQuery.data.tokenAddress,
              network
            )
            return ethers.formatUnits(lockQuery.data.price, decimals)
          },
          enabled: !!lockQuery.data,
        },
      ]
    }),
  })

  // Combine the results
  return locks.map((_, index) => {
    const lockQuery = lockQueries[index]
    const lock = lockQuery.data

    if (!lock) {
      return {
        lock: null,
        isLockLoading: lockQuery.isPending,
      }
    }

    const startIdx =
      lockQueries.slice(0, index).filter((q) => !!q.data).length * 3

    const balanceQuery = enhancementQueries[startIdx]
    const symbolQuery = enhancementQueries[startIdx + 1]
    const keyPriceQuery = enhancementQueries[startIdx + 2]

    const enhancedLock = {
      ...lock,
      balance: balanceQuery?.data,
      tokenSymbol: symbolQuery?.data,
      keyPrice: keyPriceQuery?.data,
    }

    return {
      lock: enhancedLock,
      isLockLoading:
        lockQuery.isPending ||
        balanceQuery?.isPending ||
        symbolQuery?.isPending ||
        keyPriceQuery?.isPending,
    }
  })
}
