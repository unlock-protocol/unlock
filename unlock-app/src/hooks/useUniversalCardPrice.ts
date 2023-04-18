import { useQuery } from '@tanstack/react-query'
import { storage } from '~/config/storage'

interface Options {
  network: number
  lockAddress?: string
  purchaseData: string[]
  enabled?: boolean
  recipients: string[]
}

// TODO: replace with an actual API call!
export const useUniversalCardPrice = ({
  network,
  lockAddress,
  recipients,
  purchaseData,
  enabled = true,
}: Options) => {
  return useQuery(
    ['useUniversalCardPrice', network, lockAddress, purchaseData, recipients],
    async () => {
      // const response = await storage.getTotalPrice(
      //   network,
      //   amount,
      //   tokenAddress
      // )
      // return response.data
      return {
        prices: recipients.map((r) => {
          return {
            userAddress: r,
            amount: 12.34,
            symbol: '$',
            decimals: 0,
          }
        }),
        total: 1234 + 123, // in cents!
        creditCardProcessingFee: 0, // Stripe adds their own fees later!
        unlockServiceFee: 123, // in cents
      }
    },
    {
      enabled,
    }
  )
}
