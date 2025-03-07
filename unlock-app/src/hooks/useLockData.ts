import { useQuery, useQueries } from '@tanstack/react-query'
import { Lock } from '~/unlockTypes'
import { PaywallLocksConfigType } from '@unlock-protocol/core'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { DEFAULT_USER_ACCOUNT_ADDRESS } from '~/constants'
import { config } from '~/config/app'

interface Options {
  lockAddress: string
  network: number
}

export interface LockData {
  balance: string
  tokenSymbol: string
  keyPrice: string
}

interface ExtendedLock extends Lock {
  tokenAddress: string
  price: string
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

export const useLockListData = (
  locks: Lock[]
): { data: Record<string, LockData>; isLoading: boolean; error: any } => {
  const [data, setData] = useState<Record<string, LockData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const web3service = useWeb3Service()

  useEffect(() => {
    if (!locks || locks.length === 0) return
    let isCancelled = false
    setIsLoading(true)
    const fetchData = async () => {
      try {
        const results = await Promise.all(
          locks.map(async (lock) => {
            const extendedLock = lock as ExtendedLock
            const effectiveNetwork = extendedLock.network
            const tokenAddress = extendedLock.tokenAddress
            const balance = await web3service.getAddressBalance(
              extendedLock.address,
              effectiveNetwork,
              tokenAddress === DEFAULT_USER_ACCOUNT_ADDRESS
                ? undefined
                : tokenAddress
            )
            const fetchedSymbol = await web3service.getTokenSymbol(
              tokenAddress,
              effectiveNetwork
            )
            const defaultSymbol =
              config.networks[String(effectiveNetwork)]?.nativeCurrency
                .symbol ?? ''
            // if fetchedSymbol is null or undefined, fallback to defaultSymbol
            const tokenSymbol = fetchedSymbol ?? defaultSymbol
            const decimals = await web3service.getTokenDecimals(
              tokenAddress,
              effectiveNetwork
            )
            const keyPrice = ethers.formatUnits(extendedLock.price, decimals)
            return {
              address: extendedLock.address,
              lockData: { balance, tokenSymbol, keyPrice },
            }
          })
        )
        if (!isCancelled) {
          const mapping = results.reduce(
            (acc, { address, lockData }) => {
              acc[address] = lockData
              return acc
            },
            {} as Record<string, LockData>
          )
          setData(mapping)
        }
      } catch (err) {
        if (!isCancelled) setError(err)
      }
      if (!isCancelled) setIsLoading(false)
    }
    fetchData()
    return () => {
      isCancelled = true
    }
  }, [JSON.stringify(locks), web3service])

  return { data, isLoading, error }
}
