import { useQuery } from '@tanstack/react-query'
import { storage } from '~/config/storage'

interface Options {
  network: number
  tokenAddress?: string
  amount: number
  enabled?: boolean
  lockAddress: string
  keysToPurchase?: number
}

/**
 * It includes fees (processor, ours... etc) in fiat.
 * @param param0
 * @returns
 */
export const useFiatChargePrice = ({
  network,
  tokenAddress,
  lockAddress,
  amount,
  enabled = true,
  keysToPurchase = 1,
}: Options) => {
  return useQuery(
    ['purchasePrice', network, lockAddress, tokenAddress, amount],
    async () => {
      const response = await storage.getTotalPrice(
        network,
        lockAddress,
        keysToPurchase,
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
