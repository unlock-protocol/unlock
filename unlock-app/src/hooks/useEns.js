import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import configure from '../config'

const config = configure()
/**
 * This hook reverse resolves any Ethereum address using the Ethereum Name Service
 * @param {*} address
 */
export const useEns = ({ address }) => {
  const [name, setName] = useState(address)

  const getNameForAddress = async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      config.readOnlyProvider
    )
    let name
    try {
      name = await provider.lookupAddress(address)
    } catch (error) {
      // Resolution failed. So be it, we'll show the 0x address
    }
    if (name) {
      setName(name)
    }
  }

  useEffect(() => {
    getNameForAddress()
  })
  return name
}

export default useEns
