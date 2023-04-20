import { useQuery } from '@tanstack/react-query'
import { storage } from '~/config/storage'

interface Options {
  network: number
  lockAddress: string
  purchaseData: string[]
  recipients: string[]
  enabled?: boolean
}

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
      const response = await storage.getUniversalCardPrice(
        network,
        lockAddress,
        purchaseData,
        recipients
      )
      return response.data
    },
    {
      enabled,
    }
  )
}
