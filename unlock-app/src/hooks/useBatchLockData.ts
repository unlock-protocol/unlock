import { useEffect, useState } from 'react'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { ethers } from 'ethers'
import { DEFAULT_USER_ACCOUNT_ADDRESS } from '~/constants'
import { Lock } from '~/unlockTypes'
import { config } from '~/config/app'

export interface LockData {
  balance: string
  tokenSymbol: string
  keyPrice: string
}

// ExtendedLock to ensure tokenAddress and price exist
interface ExtendedLock extends Lock {
  tokenAddress: string
  price: string
  network: number
}

const useBatchLockData = (
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
            // Use nullish coalescing: if fetchedSymbol is null or undefined, fallback to defaultSymbol
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

export default useBatchLockData
