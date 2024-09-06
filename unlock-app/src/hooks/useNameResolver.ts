import { ethers } from 'ethers'
import { useQuery } from '@tanstack/react-query'
import configure from '~/config'
import { L2_RESOLVER_ADDRESS, L2_RESOLVER_ABI } from '~/utils/baseResolver'
const config = configure()

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
 * @param {string} address - The Ethereum address to lookup.
 * @returns {Promise<string | null>} The ENS name if found, null otherwise.
 */
const getEnsName = async (address: string): Promise<string | null> => {
  try {
    const provider = new ethers.JsonRpcProvider(config.networks[1].provider)
    const ensName = await provider.lookupAddress(address)
    return ensName || null
  } catch (error) {
    console.error(`Error resolving ENS name for ${address}:`, error)
    return null
  }
}

/**
 * Fetches the basename for a given address from the L2 resolver.
 * @param {string} address - The Ethereum address to lookup.
 * @returns {Promise<string | null>} The basename if found, null otherwise.
 */
const getBaseName = async (address: string): Promise<string | null> => {
  try {
    const provider = new ethers.JsonRpcProvider(config.networks[8453].provider)
    const addressReverseNode = convertReverseNodeToBytes(address, 8453)
    const contract = new ethers.Contract(
      L2_RESOLVER_ADDRESS,
      L2_RESOLVER_ABI,
      provider
    )
    const basename = await contract.name(addressReverseNode)
    return basename || null
  } catch (error) {
    console.error(`Error resolving Base name for ${address}:`, error)
    return null
  }
}

/**
 * Hook to resolve ENS name and Base name for an Ethereum address.
 * @param {string} address - The Ethereum address to resolve.
 * @returns {Object} An object containing:
 *   - ensName: The ENS name associated with the address.
 *   - baseName: The Base name associated with the address on L2.
 *   - isEnsNameLoading: Boolean indicating if the ENS name is still loading.
 *   - isBaseNameLoading: Boolean indicating if the Base name is still loading.
 */
export const useNameResolver = (address: string) => {
  const { data: ensName, isPending: isEnsNameLoading } = useQuery({
    queryKey: ['ensName', address],
    queryFn: () => getEnsName(address),
    enabled: !!address,
  })

  const { data: baseName, isPending: isBaseNameLoading } = useQuery({
    queryKey: ['baseName', address],
    queryFn: () => getBaseName(address),
    enabled: !!address,
  })

  return {
    ensName,
    baseName,
    isEnsNameLoading,
    isBaseNameLoading,
  }
}
