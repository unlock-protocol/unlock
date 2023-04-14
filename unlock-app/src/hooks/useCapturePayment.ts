import { useMutation } from '@tanstack/react-query'
import { storage } from '~/config/storage'
import { useAuth } from '~/contexts/AuthenticationContext'

interface Options {
  network: number
  lockAddress: string
  data?: (string | null)[] | null
  referrers?: (string | null)[] | null
}

export const useCapturePayment = ({
  network,
  lockAddress,
  data,
  referrers,
}: Options) => {
  const { account } = useAuth()
  return useMutation(
    ['capturePayment', account, network, lockAddress, data, referrers],
    async ({ paymentIntent }: Record<'paymentIntent', string>) => {
      const response = await storage.capturePurchase({
        data: data as string[],
        referrers: referrers as string[],
        userAddress: account!,
        paymentIntent,
        lock: lockAddress,
        network,
      })
      return response.data.transactionHash
    }
  )
}
