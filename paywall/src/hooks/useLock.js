import { useState, useEffect } from 'react'

import LockContract from '../artifacts/contracts/PublicLock.json'
import useWeb3 from './web3/useWeb3'
import { makeGetLockAttributes } from './asyncActions/locks'

export default function useLock(lockAddress) {
  const [lock, setLock] = useState({ address: lockAddress })
  const web3 = useWeb3()

  const getLockAttributes = makeGetLockAttributes({
    web3,
    lockAddress,
    setLock,
  })
  useEffect(
    () => {
      const contract = new web3.eth.Contract(LockContract.abi, lockAddress)
      getLockAttributes(contract)
    },
    [lockAddress]
  )
  return lock
}
