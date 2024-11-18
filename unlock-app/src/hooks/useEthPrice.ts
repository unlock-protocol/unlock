import { useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

export const useEthPrice = ({
  amount,
  network,
}: {
  amount: string | undefined
  network: number
}) => {
  return useQuery({
    queryKey: ['getEthPrice', amount, network],
    queryFn: async () => {
      if (!amount) return null
      try {
        const response = await locksmith.price(network, parseFloat(amount))
        return response.data.result?.priceInAmount
      } catch (error) {
        return null
      }
    },
    enabled: !!amount,
  })
}
