import { useState, useContext } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'
import { RawLock } from '../unlockTypes'
import { WalletServiceContext } from '../utils/withWalletService'

type PurchaseError = Error | null

export const usePurchaseKey = (setTransactionHash: (hash: string) => void) => {
  const [error, setError] = useState(null as PurchaseError)

  const walletService: WalletService = useContext(WalletServiceContext)

  const purchaseKey = (lock: RawLock, accountAddress: string) => {
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
        } else if (hash) {
          setTransactionHash(hash)
        }
      }
    )
  }

  return { purchaseKey, error }
}
