import { ethers } from 'ethers'
import configure from '../config'
import { useNameResolver } from './useNameResolver'

const config = configure()

export const getAddressForName = async (_name: string): Promise<string> => {
  try {
    const name = _name.trim()
    const isAddress = name.split('.').pop()?.toLowerCase() !== 'eth'
    if (isAddress) {
      return name
    }
    const result = await new ethers.JsonRpcProvider(
      config.networks[1].provider
    ).resolveName(name)
    return result || ''
  } catch (error) {
    // Resolution failed. So be it, we'll show the 0x address
    console.error(`We could not resolve ENS address for ${name}`)
    return ''
  }
}

/**
 * This hook reverse resolves any Ethereum address using the Ethereum Name Service
 * This hook is depracted and should be replaced with useNameResolver where applicable.
 * @param {*} address
 */
export const useEns = (address: string) => {
  const { ensName, baseName } = useNameResolver(address)
  return ensName || baseName || address
}
export default useEns
