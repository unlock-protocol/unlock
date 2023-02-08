import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import configure from '../config'

const config = configure()

export const getNameOrAddressForAddress = async (
  _address: string
): Promise<string> => {
  try {
    const address = _address.trim()
    const isNotENS = ethers.utils.isAddress(address)
    if (isNotENS) {
      return address
    }
    const result = await new ethers.providers.JsonRpcBatchProvider(
      config.networks[1].provider
    ).lookupAddress(address)
    if (result) {
      return result
    }
    return address
  } catch (error) {
    // Resolution failed. So be it, we'll show the 0x address
    console.error(`We could not resolve ENS name for ${_address}`)
    return _address
  }
}

export const getAddressForName = async (_name: string): Promise<string> => {
  try {
    const name = _name.trim()
    const isAddress = name.split('.').pop()?.toLowerCase() !== 'eth'
    if (isAddress) {
      return name
    }
    const result = await new ethers.providers.JsonRpcBatchProvider(
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
 * @param {*} address
 */
export const useEns = (address: string) => {
  const [name, setName] = useState(address)

  const getNameForAddress = async (_address: string) => {
    setName(await getNameOrAddressForAddress(_address))
  }

  useEffect(() => {
    getNameForAddress(address)
  }, [address])

  return name
}

export default useEns
