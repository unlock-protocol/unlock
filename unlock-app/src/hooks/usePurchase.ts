import { useMutation } from '@tanstack/react-query'
import { storage } from '~/config/storage'

interface Options {
  lockAddress: string
  network: number
}
interface PurchaseOptions {
  recipients: string[]
  pricing: number
  recurring?: number
  stripeTokenId: string
}
export const usePurchase = ({ lockAddress, network }: Options) => {
  return useMutation(
    ['purchase', network, lockAddress],
    async ({
      pricing,
      recipients,
      recurring = 0,
      stripeTokenId,
    }: PurchaseOptions) => {
      const response = await storage.purchase(network, lockAddress, {
        stripeTokenId,
        pricing,
        recipients,
        recurring,
      })
      return response.data
    },
    {
      retry: 2,
    }
  )
}
