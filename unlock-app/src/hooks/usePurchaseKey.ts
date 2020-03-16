import { useState, useContext } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'
import { RawLock } from '../unlockTypes'
import { WalletServiceContext } from '../utils/withWalletService'
import { ConfigContext } from '../utils/withConfig'
import { StorageServiceContext } from '../utils/withStorageService'
import { StorageService } from '../services/storageService'

type TransactionHash = string | null
type PurchaseError = Error | null

export const usePurchaseKey = (lock: RawLock, accountAddress: string) => {
  const [transactionHash, setTransactionHash] = useState(
    null as TransactionHash
  )
  const [error, setError] = useState(null as PurchaseError)

  const walletService: WalletService = useContext(WalletServiceContext)
  const config: any = useContext(ConfigContext)
  const storageService: StorageService = useContext(StorageServiceContext)

  const purchaseKey = () => {
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
          // Let's save this into locksmith!
          setTransactionHash(hash)
          storageService.storeTransaction(
            hash,
            accountAddress,
            lock.address,
            config.requiredNetworkId,
            accountAddress,
            transaction.data
          )
        }
      }
    )
  }

  return { purchaseKey, error, transactionHash }
}
