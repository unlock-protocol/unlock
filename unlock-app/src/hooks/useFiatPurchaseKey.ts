import { useState, useContext } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'
import { StorageServiceContext } from '../utils/withStorageService'
import { WalletServiceContext } from '../utils/withWalletService'
import { StorageService } from '../services/storageService'
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
  const storageService: StorageService = useContext(StorageServiceContext)
  const walletService: WalletService = useContext(WalletServiceContext)
  const { dispatch } = useCheckoutStore()
  const [loading, setLoading] = useState(true)

  const purchaseKey = async (lockAddress: string, accountAddress: string) => {
    setLoading(true)
    const { data, sig } = await signKeyPurchaseRequestData(
      {
        recipient: accountAddress,
        lock: lockAddress,
      },
      walletService
    )
    const transactionHash = await storageService.purchaseKey(data, btoa(sig))

    dispatch(setTransactionHash(transactionHash))
    emitTransactionInfo({
      hash: transactionHash,
      lock: lockAddress,
    })
    setLoading(false)
  }

  return { loading, purchaseKey }
}
