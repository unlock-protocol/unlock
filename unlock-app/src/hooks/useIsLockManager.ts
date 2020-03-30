import { useContext, useState, useEffect } from 'react'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { Web3ServiceContext } from '../utils/withWeb3Service'

export const useIsLockManager = (
  lockAddress: string,
  accountAddress: string
) => {
  const web3Service: Web3Service = useContext(Web3ServiceContext)

  const [isLockManager, setIsLockManager] = useState(false)

  async function getLockManagementStatus() {
    const ilm = await web3Service.isLockManager(lockAddress, accountAddress)
    setIsLockManager(ilm)
  }

  useEffect(() => {
    getLockManagementStatus()
  }, [lockAddress, accountAddress])

  return { isLockManager }
}

export default useIsLockManager
