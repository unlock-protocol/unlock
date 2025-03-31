import { ethers } from 'ethers'
import { useQuery, useQueries } from '@tanstack/react-query'
import configure from '~/config'
import { L2_RESOLVER_ADDRESS, L2_RESOLVER_ABI } from '~/utils/baseResolver'
import { limitFunction } from 'p-limit'
import ensProvider from '~/utils/ensProvider'

const config = configure()

const maxConcurrency = 10

// cache constants
const NAME_STALE_TIME = 1 * 24 * 60 * 60 * 1000
const NAME_CACHE_TIME = 1 * 24 * 60 * 60 * 1000

const BasenameContract = new ethers.Contract(
  L2_RESOLVER_ADDRESS,
  L2_RESOLVER_ABI,
  new ethers.JsonRpcProvider(config.networks[8453].provider)
)

/**
 * Converts a chain ID to its corresponding coin type for ENS compatibility.
 * @param {number} chainId - The chain ID to convert.
 * @returns {string} The coin type as a hexadecimal string.
 */
const convertChainIdToCoinType = (chainId: number): string => {
  if (chainId === 1) {
    return 'addr'
  }
  const cointype = (0x80000000 | chainId) >>> 0
  return cointype.toString(16).toLocaleUpperCase()
}

/**
 * Generates reverse node bytes for address resolution.
 * @param {string} address - The Ethereum address to convert.
 * @param {number} chainId - The chain ID for the network.
 * @returns {string} The reverse node as a bytes32 string.
 */
const convertReverseNodeToBytes = (
  address: string,
  chainId: number
): string => {
  const addressFormatted = address.toLowerCase()
  const addressNode = ethers.keccak256(
    ethers.toUtf8Bytes(addressFormatted.substring(2))
  )
  const chainCoinType = convertChainIdToCoinType(chainId)
  const baseReverseNode = ethers.namehash(
    `${chainCoinType.toLocaleUpperCase()}.reverse`
  )
  return ethers.solidityPackedKeccak256(
    ['bytes32', 'bytes32'],
    [baseReverseNode, addressNode]
  )
}

/**
 * Fetches the ENS name for a given address.
 */
export const getEnsName = limitFunction(
  async (address: string): Promise<string | null> => {
    try {
      const ensName = await ensProvider.lookupAddress(address)
      return ensName || address
    } catch (error) {
      console.error(`Error resolving ENS name for ${address}:`, error)
      return null
    }
  },
  { concurrency: maxConcurrency }
)

/**
 * Fetches the basename for a given address from the L2 resolver.
 */
export const getBaseName = limitFunction(
  async (address: string): Promise<string | null> => {
    try {
      const addressReverseNode = convertReverseNodeToBytes(address, 8453)
      const basename = await BasenameContract.name(addressReverseNode).catch(
        (error) => {
          console.log(error)
        }
      )
      return basename || address
    } catch (error) {
      console.error(`Error resolving Base name for ${address}:`, error)
      return null
    }
  },
  { concurrency: maxConcurrency }
)

/**
 * Helper function to resolve a single address using ENS and Base name.
 */
export const resolveAddress = async (
  address: string,
  preferredResolver: 'ens' | 'base' | 'multiple' = 'multiple'
): Promise<string> => {
  const [ensName, baseName] = await Promise.all([
    getEnsName(address),
    getBaseName(address),
  ])

  if (preferredResolver === 'ens') {
    return ensName || baseName || address
  } else if (preferredResolver === 'base') {
    return baseName || ensName || address
  } else {
    return ensName || baseName || address
  }
}

/**
 * Resolves a batch of addresses using React Query's cache.
 * Streams updates as each address is resolved.
 * @param addresses Array of addresses to resolve
 * @returns Record of addresses to resolved names
 */
export const batchNameResolver = async (
  addresses: string[]
): Promise<Record<string, string>> => {
  // Remove duplicates
  const uniqueAddresses = Array.from(new Set(addresses))
  const resolvedMap: Record<string, string> = {}

  // Resolve addresses in parallel but process in batches
  const batchSize = 5
  for (let i = 0; i < uniqueAddresses.length; i += batchSize) {
    const batch = uniqueAddresses.slice(i, i + batchSize)
    await Promise.all(
      batch.map(async (address) => {
        const resolved = await resolveAddress(address)
        resolvedMap[address] = resolved
      })
    )
  }

  return resolvedMap
}

/**
 * Fetches the Ethereum address for a given ENS name.
 * @param {string} _name - The ENS name to resolve.
 * @returns {Promise<string>} The resolved address or an empty string if resolution fails.
 */
export const getAddressForName = async (_name: string): Promise<string> => {
  try {
    const name = _name.trim()
    const isAddress = name.split('.').pop()?.toLowerCase() !== 'eth'
    if (isAddress) {
      return name
    }
    const result = await ensProvider.resolveName(name)
    return result || ''
  } catch (error) {
    // Resolution failed. So be it, we'll show the 0x address
    console.error(`We could not resolve ENS address for ${name}`)
    return ''
  }
}

/**
 * Hook to resolve ENS name and Base name for an Ethereum address.
 *
 * @param {string} address - The Ethereum address to resolve.
 * @param {boolean} skipResolution - If true, name resolution is skipped.
 * @returns {Object} An object containing:
 *   - ensName: The ENS name associated with the address, or undefined if skipped.
 *   - baseName: The Base name associated with the address on L2, or undefined if skipped.
 *   - isEnsNameLoading: Boolean indicating if the ENS name is still loading.
 *   - isBaseNameLoading: Boolean indicating if the Base name is still loading.
 */
export const useNameResolver = (
  address: string,
  skipResolution: boolean = false
) => {
  const queryParams = {
    staleTime: NAME_STALE_TIME,
    gcTime: NAME_CACHE_TIME,
    retry: 0,
    refetchOnWindowFocus: false,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  }

  const results = useQueries({
    queries: [
      {
        queryKey: ['ensName', address],
        queryFn: () => getEnsName(address),
        enabled: !!address && !skipResolution,
        ...queryParams,
      },
      {
        queryKey: ['baseName', address],
        queryFn: () => getBaseName(address),
        enabled: !!address && !skipResolution,
        ...queryParams,
      },
    ],
  })

  const [ensResult, baseResult] = results

  return {
    ensName: skipResolution ? undefined : ensResult.data,
    baseName: skipResolution ? undefined : baseResult.data,
    isEnsNameLoading: ensResult.isPending,
    isBaseNameLoading: baseResult.isPending,
  }
}

/**
 * Custom hook for resolving a single address using React Query.
 * Uses the query cache for efficient resolution.
 * @param address Address to resolve
 * @param preferredResolver Preferred resolution method
 * @param skipResolution Whether to skip resolution
 * @returns Object with resolved name and loading state
 */
export const useResolvedName = (
  address: string | undefined,
  preferredResolver: 'ens' | 'base' | 'multiple' = 'multiple',
  skipResolution: boolean = false
) => {
  const { data: resolvedName, isPending: isLoading } = useQuery({
    queryKey: ['resolvedName', address, preferredResolver],
    queryFn: async () => {
      if (!address) return undefined
      return resolveAddress(address, preferredResolver)
    },
    enabled: !!address && !skipResolution,
    staleTime: NAME_STALE_TIME,
    gcTime: NAME_CACHE_TIME,
    refetchOnWindowFocus: false,
  })

  return { resolvedName, isLoading }
}

/**
 * Custom hook for batch resolving multiple addresses efficiently
 * Updates names as they resolve, allowing UI to update incrementally
 */
export const useBatchNameResolver = (
  addresses: string[],
  skipResolution: boolean = false
) => {
  const uniqueAddresses = Array.from(new Set(addresses.filter(Boolean)))

  const results = useQueries({
    queries: uniqueAddresses.map((address) => ({
      queryKey: ['resolvedName', address, 'multiple'],
      queryFn: () => {
        return resolveAddress(address, 'multiple')
      },
      staleTime: NAME_STALE_TIME,
      gcTime: NAME_CACHE_TIME,
      enabled: !skipResolution && !!address,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    })),
  })

  const resolvedNames = results.reduce(
    (acc, result, index) => {
      const address = uniqueAddresses[index]
      // Use the resolved name if available, otherwise default to the original address
      acc[address] = result.data || address
      return acc
    },
    {} as Record<string, string>
  )

  // The hook is loading if any of the individual queries are pending
  const isLoading = results.some((result) => result.isPending)

  return {
    resolvedNames,
    isLoading,
  }
}
