import { useContext, useState, useEffect } from 'react'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { Web3ServiceContext } from '../utils/withWeb3Service'

export const useIsLockManager = (
  lockAddress: string,
  network: number,
  accountAddress?: string | null
) => {
  const web3Service: Web3Service = useContext(Web3ServiceContext)

  const [isLockManager, setIsLockManager] = useState(false)
  const [loading, setLoading] = useState(true)

  async function getLockManagementStatus() {
    if (accountAddress) {
      const isLockManager = await web3Service.isLockManager(
        lockAddress,
        accountAddress,
        network
      )
      setIsLockManager(isLockManager)
    } else {
      setIsLockManager(false)
    }
    setLoading(false)
  }

  useEffect(() => {
    getLockManagementStatus()
  }, [lockAddress, accountAddress])

  return { isLockManager, loading }
}

export default useIsLockManager
