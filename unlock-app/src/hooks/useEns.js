import { ethers } from 'ethers'
import { useState, useEffect, useContext } from 'react'
import { AuthenticationContext } from '../contexts/AuthenticationContext'
import configure from '../config'

const config = configure()

export const getNameOrAddressForAddress = async (address) => {
  try {
    const result = await new ethers.providers.JsonRpcProvider(
      config.networks[1].publicProvider
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

export const getAddressForName = async (name) => {
  try {
    const result = await new ethers.providers.JsonRpcProvider(
      config.networks[1].publicProvider
    ).resolveName(name)
    return result
  } catch (error) {
    // Resolution failed. So be it, we'll show the 0x address
    console.error(`We could not resolve ENS for ${name}`)
    return null
  }
}

/**
 * This hook reverse resolves any Ethereum address using the Ethereum Name Service
 * @param {*} address
 */
export const useEns = (address) => {
  const [name, setName] = useState(address)

  const getNameForAddress = async (_address) => {
    setName(await getNameOrAddressForAddress(_address))
  }

  useEffect(() => {
    getNameForAddress(address)
  }, [address])

  return name
}

export default useEns
