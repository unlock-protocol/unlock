import { useContext, useState, useEffect } from 'react'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { Web3ServiceContext } from '../utils/withWeb3Service'
import { RawLock } from '../unlockTypes'

export const usePaywallLocks = (lockAddresses: string[]) => {
  const web3Service: Web3Service = useContext(Web3ServiceContext)

  const [loading, setLoading] = useState(true)
  const [locks, setLocks] = useState([] as RawLock[])

  async function getLocks() {
    setLoading(true)

    const lockPromises = lockAddresses.map(async address => {
      return web3Service.getLock(address)
    })

    const locks = await Promise.all(lockPromises)
    setLocks(locks)
    setLoading(false)
  }

  useEffect(() => {
    getLocks()
  }, [lockAddresses])

  return { locks, loading }
}

export default usePaywallLocks
