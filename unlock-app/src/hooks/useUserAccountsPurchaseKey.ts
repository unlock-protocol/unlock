import { useState, useEffect, useContext } from 'react'
import { useProvider } from './useProvider'
import { StorageServiceContext } from '../utils/withStorageService'
import { StorageService } from '../services/storageService'
import { RawLock } from '../unlockTypes'
import { TransactionInfo } from './useCheckoutCommunication'

export const useUserAccountsPurchaseKey = (
  emitTransactionInfo: (info: TransactionInfo) => void
) => {
  const { provider } = useProvider()
  const storageService: StorageService = useContext(StorageServiceContext)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (provider) {
      setLoading(false)
    }
  }, [provider])

  const purchaseKey = async (lock: RawLock, accountAddress: string) => {
    const { data, sig } = provider!.signKeyPurchaseRequestData({
      recipient: accountAddress,
      lockAddress: lock.address,
    })
    const transactionHash = await storageService.purchaseKey(data, btoa(sig))
    emitTransactionInfo({
      hash: transactionHash,
      lock: lock.address,
    })
  }

  return { loading, purchaseKey }
}
