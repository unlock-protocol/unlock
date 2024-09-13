import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

interface Options {
  lockAddress: string
  network: number
}
interface PurchaseOptions {
  recipients: string[]
  pricing: number
  recurring?: number
  stripeTokenId: string
  data?: string[]
  referrers?: string[]
}
export const usePurchase = ({ lockAddress, network }: Options) => {
  return useMutation({
    mutationKey: ['purchase', network, lockAddress],
    mutationFn: async ({
      pricing,
      recipients,
      recurring = 0,
      stripeTokenId,
      data,
      referrers,
    }: PurchaseOptions) => {
      const response = await locksmith.purchase(network, lockAddress, {
        stripeTokenId,
        pricing,
        recipients,
        recurring,
        data,
        referrers,
      })
      return response.data
    },
    retry: 2,
  })
}
