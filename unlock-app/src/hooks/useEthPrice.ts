import { useQuery } from '@tanstack/react-query'

export const useEthPrice = () => {
  return useQuery({
    queryKey: ['getEthPrice'],
    queryFn: async () => {
      try {
        const response = await fetch(
          'https://api.coinbase.com/v2/exchange-rates?currency=ETH'
        )
        const json = await response.json()
        const price = parseFloat(json.data.rates.USD)
        return price > 0 ? price : null
      } catch (error) {
        return null
      }
    },
  })
}
