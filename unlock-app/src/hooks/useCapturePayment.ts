import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import { useAuthenticate } from './useAuthenticate'

interface Options {
  network: number
  lockAddress: string
  recipients: string[]
  data?: (string | null)[] | null
  referrers?: (string | null)[] | null
  purchaseType?: 'extend' | 'purchase'
}

export const useCapturePayment = ({
  network,
  lockAddress,
  data,
  referrers,
  recipients,
  purchaseType,
}: Options) => {
  const { account } = useAuthenticate()
  return useMutation({
    mutationKey: [
      'capturePayment',
      account,
      network,
      lockAddress,
      recipients,
      data,
      referrers,
      purchaseType,
    ],
    mutationFn: async ({ paymentIntent }: Record<'paymentIntent', string>) => {
      const response = await locksmith.capturePurchase({
        data: data as string[],
        referrers: referrers as string[],
        userAddress: account!,
        paymentIntent,
        lock: lockAddress,
        network,
        recipients,
        purchaseType,
      })
      return response.data.transactionHash
    },
  })
}
