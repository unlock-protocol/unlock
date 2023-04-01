import { useQuery } from '@tanstack/react-query'
import { storage } from '~/config/storage'

interface USDPricingOptions {
  network: number
  lockAddress: string
  currencyContractAddress?: string | null
  amount: number
  enabled?: boolean
}

export const useUSDPricing = ({
  network,
  lockAddress,
  currencyContractAddress,
  amount = 1,
  enabled = true,
}: USDPricingOptions) => {
  return useQuery(
    ['price', network, lockAddress, currencyContractAddress, amount],
    async () => {
      try {
        const response = await storage.price(
          network,
          amount,
          currencyContractAddress ?? undefined
        )
        const result = response.data.result
        return {
          amount: result?.priceInAmount,
          confidence: result?.confidence,
        }
      } catch (error) {
        console.error(error)
        return {
          amount: undefined,
          confidence: undefined,
        }
      }
    },
    {
      enabled,
    }
  )
}
