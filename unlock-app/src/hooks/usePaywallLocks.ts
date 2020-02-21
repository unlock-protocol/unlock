import { useContext, useState, useEffect } from 'react'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { Web3ServiceContext } from '../utils/withWeb3Service'
import { RawLock } from '../unlockTypes'

export const usePaywallLocks = (
  lockAddresses: string[],
  getTokenBalance: (contractAddress: string) => void
) => {
  const web3Service: Web3Service = useContext(Web3ServiceContext)

  const [loading, setLoading] = useState(true)
  const [locks, setLocks] = useState([] as RawLock[])

  async function getLocks() {
    setLoading(true)

    const lockPromises = lockAddresses.map(async address => {
      return web3Service.getLock(address)
    })

    const locks = await Promise.all(lockPromises)
    locks.forEach((lock, index) => {
      if (lock.currencyContractAddress) {
        getTokenBalance(lock.currencyContractAddress)
      }

      // getLock doesn't always return the lock address apparently
      lock.address = lockAddresses[index]
    })
    setLoading(false)
    setLocks(locks)
  }

  useEffect(() => {
    getLocks()
  }, [])

  return { locks, loading }
}

export default usePaywallLocks
