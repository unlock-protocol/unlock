import { useQuery } from '@tanstack/react-query'
import { storage } from '~/config/storage'

interface Options {
  network: number
  tokenAddress?: string | null
  amount: number
  enabled?: boolean
}

/**
 * It includes fees (processor, ours... etc) in fiat.
 * @param param0
 * @returns
 */
export const useFiatChargePrice = ({
  network,
  tokenAddress,
  amount,
  enabled = true,
}: Options) => {
  return useQuery(
    ['purchasePrice', network, tokenAddress, amount],
    async () => {
      const response = await storage.getTotalPrice(
        network,
        amount,
        tokenAddress ?? undefined
      )
      return response.data
    },
    {
      enabled,
    }
  )
}
