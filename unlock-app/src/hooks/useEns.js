import { ethers } from 'ethers'
import { useState, useEffect, useContext } from 'react'
import { AuthenticationContext } from '../components/interface/Authenticate'
import { ConfigContext } from '../utils/withConfig'
/**
 * This hook reverse resolves any Ethereum address using the Ethereum Name Service
 * @param {*} address
 */
export const useEns = (address) => {
  const config = useContext(ConfigContext)
  const { network } = useContext(AuthenticationContext)
  const [name, setName] = useState(address)

  const getNameForAddress = async (_address) => {
    if (config.networks[network]) {
      const provider = new ethers.providers.JsonRpcProvider(
        config.networks[network].provider
      )
      try {
        const result = await provider.lookupAddress(_address)
        if (result) {
          setName(result)
        } else {
          setName(_address)
        }
      } catch (error) {
        // Resolution failed. So be it, we'll show the 0x address
        setName(_address)
      }
    }
  }

  useEffect(() => {
    getNameForAddress(address)
  }, [address])

  return name
}

export default useEns
