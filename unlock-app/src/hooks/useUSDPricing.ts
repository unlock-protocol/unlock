import { useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

interface USDPricingOptions {
  network: number
  lockAddress: string
  currencyContractAddress?: string | null
  amount: number
  enabled?: boolean
}

export const getLockUsdPrice = async ({
  network,
  currencyContractAddress,
  amount,
}: Omit<USDPricingOptions, 'enabled' | 'lockAddress'>) => {
  try {
    const response = await locksmith.price(
      network,
      amount,
      currencyContractAddress ?? undefined
    )
    const result = response.data.result
    return {
      usd: {
        amount: result?.priceInAmount,
        confidence: result?.confidence,
      },
    }
  } catch (error) {
    console.error(error)
    return {
      amount: undefined,
      confidence: undefined,
    }
  }
}

export const useUSDPricing = ({
  network,
  lockAddress,
  currencyContractAddress,
  amount = 1,
  enabled = true,
}: USDPricingOptions) => {
  return useQuery({
    queryKey: ['price', network, lockAddress, currencyContractAddress, amount],
    queryFn: async () =>
      getLockUsdPrice({
        network,
        currencyContractAddress,
        amount,
      }),
    enabled,
  })
}
