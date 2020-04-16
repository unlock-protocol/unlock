import { useState, useEffect, useContext } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'
import { useProvider } from './useProvider'
import { StorageServiceContext } from '../utils/withStorageService'
import { WalletServiceContext } from '../utils/withWalletService'
import { StorageService } from '../services/storageService'
import { RawLock } from '../unlockTypes'
import { TransactionInfo } from './useCheckoutCommunication'
import { setTransactionHash } from '../utils/checkoutActions'
import { useCheckoutStore } from './useCheckoutStore'
import UnlockPurchaseRequest from '../structured_data/unlockPurchaseRequest'

interface KeyPurchaseRequestData {
  recipient: string
  lock: string
}
export const signKeyPurchaseRequestData = async (
  input: KeyPurchaseRequestData,
  walletService: any
) => {
  // default signature expiration to now + 60 seconds
  const expiry = Math.floor(Date.now() / 1000) + 60
  const purchaseRequest = {
    expiry,
    ...input,
  }
  const data = UnlockPurchaseRequest.build(purchaseRequest)
  const sig = await walletService.unformattedSignTypedData(
    input.recipient,
    data
  )

  return {
    data,
    sig,
  }
}

export const useFiatPurchaseKey = (
  emitTransactionInfo: (info: TransactionInfo) => void
) => {
  const { provider } = useProvider()
  const storageService: StorageService = useContext(StorageServiceContext)
  const walletService: WalletService = useContext(WalletServiceContext)
  const { dispatch } = useCheckoutStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (provider) {
      setLoading(false)
    }
  }, [provider])

  const purchaseKey = async (lock: RawLock, accountAddress: string) => {
    const { data, sig } = await signKeyPurchaseRequestData(
      {
        recipient: accountAddress,
        lock: lock.address,
      },
      walletService
    )

    const transactionHash = await storageService.purchaseKey(data, btoa(sig))

    dispatch(setTransactionHash(transactionHash))
    emitTransactionInfo({
      hash: transactionHash,
      lock: lock.address,
    })
  }

  return { loading, purchaseKey }
}
