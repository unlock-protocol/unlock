import { useState, useContext } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'
import { RawLock } from '../unlockTypes'
import { WalletServiceContext } from '../utils/withWalletService'
import { ConfigContext } from '../utils/withConfig'
import { StorageServiceContext } from '../utils/withStorageService'
import { StorageService } from '../services/storageService'
import { useCheckoutStore } from './useCheckoutStore'
import { setTransactionHash } from '../utils/checkoutActions'
import { TransactionInfo } from './useCheckoutCommunication'

type PurchaseError = Error | null

export const usePurchaseKey = (
  emitTransactionInfo: (info: TransactionInfo) => void
) => {
  const [error, setError] = useState(null as PurchaseError)

  const walletService: WalletService = useContext(WalletServiceContext)
  const config: any = useContext(ConfigContext)
  const storageService: StorageService = useContext(StorageServiceContext)
  const { dispatch } = useCheckoutStore()

  const purchaseKey = (lock: RawLock, accountAddress: string) => {
    walletService.purchaseKey(
      {
        lockAddress: lock.address,
        owner: accountAddress,
        keyPrice: lock.keyPrice,
        erc20Address: lock.currencyContractAddress,
      },
      (error: any, hash: string | null, transaction: any) => {
        if (error) {
          setError(error)
        } else if (hash) {
          // notify the app store of the transaction hash
          dispatch(setTransactionHash(hash))

          // Let's save this into locksmith!
          storageService.storeTransaction(
            hash,
            accountAddress,
            lock.address,
            config.requiredNetworkId,
            accountAddress,
            transaction.data
          )

          // emit transaction info to main window
          emitTransactionInfo({
            lock: lock.address,
            hash,
          })
        }
      }
    )
  }

  return { purchaseKey, error }
}
