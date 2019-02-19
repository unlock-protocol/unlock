import { useState, useEffect } from 'react'

import useWeb3 from './web3/useWeb3Service'

export default function useLockFromService(lockAddress) {
  const [lock, setLock] = useState({ address: lockAddress })
  const web3 = useWeb3()

  const listenForLocks = (address, update) => {
    setLock(update)
  }
  useEffect(
    () => {
      if (!web3) return
      web3.addEventListener('lock.updated', listenForLocks)
      return () => web3.removeEventListener('lock.updated', listenForLocks)
    },
    [web3, lockAddress]
  )
  return lock
}
