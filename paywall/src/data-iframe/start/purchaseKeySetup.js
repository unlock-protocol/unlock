import { waitFor } from '../../utils/promises'

let purchase

export function setPurchaseKeyCallback(purchaseKeyCallback) {
  purchase = purchaseKeyCallback
}

export async function purchaseKey(lockAddress, extraTip) {
  // resolve when purchasing is ready
  await waitFor(() => purchase)
  return purchase(lockAddress, extraTip)
}
