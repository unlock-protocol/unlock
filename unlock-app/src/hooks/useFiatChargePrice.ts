import { useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

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
  return useQuery({
    queryKey: ['purchasePrice', network, tokenAddress, amount],
    queryFn: async () => {
      const response = await locksmith.getTotalPrice(
        network,
        amount,
        tokenAddress ?? undefined
      )
      return response.data
    },
    enabled,
  })
}
