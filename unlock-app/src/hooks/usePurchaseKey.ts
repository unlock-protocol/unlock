import { useState, useContext } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'
import { RawLock } from '../unlockTypes'
import { WalletServiceContext } from '../utils/withWalletService'

type TransactionHash = string | null
type PurchaseError = Error | null

export const usePurchaseKey = (lock: RawLock, accountAddress: string) => {
  const [transactionHash, setTransactionHash] = useState(
    null as TransactionHash
  )
  const [error, setError] = useState(null as PurchaseError)

  const walletService: WalletService = useContext(WalletServiceContext)

  const purchaseKey = () => {
    walletService.purchaseKey(
      {
        lockAddress: lock.address,
        owner: accountAddress,
        keyPrice: lock.keyPrice,
        erc20Address: lock.currencyContractAddress,
      },
      (error, hash) => {
        if (error) {
          setError(error)
        } else {
          setTransactionHash(hash)
        }
      }
    )
  }

  return { purchaseKey, error, transactionHash }
}
