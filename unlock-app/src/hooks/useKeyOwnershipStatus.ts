import { useContext, useState, useEffect } from 'react'
import { Web3Service, KeyResult } from '@unlock-protocol/unlock-js'
import { Web3ServiceContext } from '../utils/withWeb3Service'

export const useKeyOwnershipStatus = (
  lockAddresses: string[],
  accountAddress: string
) => {
  const [keys, setKeys] = useState<KeyResult[]>([])
  const [loading, setLoading] = useState(true)

  const web3Service: Web3Service = useContext(Web3ServiceContext)

  const getKeyStatuses = async () => {
    setLoading(true)
    const keyResults = await Promise.all(
      lockAddresses.map((lockAddress) => {
        return web3Service.getKeyByLockForOwner(lockAddress, accountAddress)
      })
    )

    setKeys(keyResults)
    setLoading(false)
  }

  useEffect(() => {
    getKeyStatuses()
  }, [lockAddresses, accountAddress])

  return { keys, loading }
}
