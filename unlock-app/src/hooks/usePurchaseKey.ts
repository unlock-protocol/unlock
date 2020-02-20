import { useState, useContext } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'
import { RawLock } from '../unlockTypes'
import { WalletServiceContext } from '../utils/withWalletService'

export const usePurchaseKey = (lock: RawLock) => {
  const [initiatedPurchase, setInitiatedPurchase] = useState(false)
  const walletService: WalletService = useContext(WalletServiceContext)

  const purchaseKey = () => {
    setInitiatedPurchase(true)
    walletService.purchaseKey({
      lockAddress: lock.address,
      owner: lock.owner!,
      keyPrice: lock.keyPrice,
      erc20Address: lock.currencyContractAddress,
    })
  }

  return { purchaseKey, initiatedPurchase }
}
