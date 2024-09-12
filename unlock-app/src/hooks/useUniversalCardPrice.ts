import { useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

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
  return useQuery({
    queryKey: [
      'useUniversalCardPrice',
      network,
      lockAddress,
      purchaseData,
      recipients,
    ],
    queryFn: async () => {
      const response = await locksmith.getUniversalCardPrice(
        network,
        lockAddress,
        purchaseData,
        recipients
      )
      return response.data
    },
    enabled,
  })
}
