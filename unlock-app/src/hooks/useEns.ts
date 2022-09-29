import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import configure from '../config'

const config = configure()
const publicProvider = config.networks[1].publicProvider

export const getNameOrAddressForAddress = async (
  address: string
): Promise<string> => {
  try {
    const result = await new ethers.providers.JsonRpcProvider(
      publicProvider
    ).lookupAddress(address)
    if (result) {
      return result
    }
    return address
  } catch (error) {
    // Resolution failed. So be it, we'll show the 0x address
    console.error(`We could not resolve ENS for ${address}`)
    return address
  }
}

export const getAddressForName = async (name: string): Promise<string> => {
  try {
    const result = await new ethers.providers.JsonRpcProvider(
      publicProvider
    ).resolveName(name)
    return result || ''
  } catch (error) {
    // Resolution failed. So be it, we'll show the 0x address
    console.error(`We could not resolve ENS for ${name}`)
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
