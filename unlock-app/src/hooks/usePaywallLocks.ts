import { useContext, useState, useEffect } from 'react'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { Web3ServiceContext } from '../utils/withWeb3Service'
import { RawLock, PaywallConfig } from '../unlockTypes'

export const usePaywallLocks = (
  lockAddresses: string[],
  getTokenBalance: (contractAddress: string) => void,
  config: PaywallConfig
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
        // This is the easiest place to determine which tokens we need
        // to query for the user's balance of. The values are tracked
        // in the useGetTokenBalance hook.
        getTokenBalance(lock.currencyContractAddress)
      }

      // getLock doesn't always return the lock address apparently
      // We keep consistency from the config
      lock.address = lockAddresses[index]
      if (config.locks[lock.address].name) {
        lock.name = config.locks[lock.address].name
      }
    })
    setLoading(false)
    setLocks(locks)
  }

  useEffect(() => {
    getLocks()
  }, [lockAddresses])

  return { locks, loading }
}

export default usePaywallLocks
