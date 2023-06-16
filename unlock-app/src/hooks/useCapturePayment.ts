import { useMutation } from '@tanstack/react-query'
import { storage } from '~/config/storage'
import { useAuth } from '~/contexts/AuthenticationContext'

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
  const { account } = useAuth()
  return useMutation(
    [
      'capturePayment',
      account,
      network,
      lockAddress,
      recipients,
      data,
      referrers,
      purchaseType,
    ],
    async ({ paymentIntent }: Record<'paymentIntent', string>) => {
      const response = await storage.capturePurchase({
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
    }
  )
}
