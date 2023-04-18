import { useQuery } from '@tanstack/react-query'
import { storage } from '~/config/storage'

interface Options {
  network: number
  tokenAddress?: string
  amount: number
  enabled?: boolean
}

export const useTotalPrice = ({
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
        tokenAddress
      )
      return response.data
    },
    {
      enabled,
    }
  )
}
