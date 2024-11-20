import { useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

/**
 * Custom hook to fetch the current price of Ethereum (ETH) based on the specified amount and network.
 * 1. If converting USD to ETH (currency='USD'):
 *    - First gets the price of 1 ETH in USD
 *    - Adds $0.01 to the input USD amount for gas fees
 *    - Calculates the ETH equivalent of the adjusted USD amount
 *
 * 2. If converting ETH to USD (currency='ETH'):
 *    - Directly fetches the USD price for the specified ETH amount
 *
 * @param {Object} params - Parameters for the hook.
 * @param {string | undefined} params.amount - The amount to convert
 * @param {number} params.network - The network identifier for fetching the price
 * @param {'ETH' | 'USD'} [params.currency='ETH'] - The source currency to convert from
 *
 * @returns {Object} Query result containing the converted amount or null if:
 *  - amount is not provided
 *  - an error occurs
 *  - price data is unavailable
 */

export const useEthPrice = ({
  amount,
  network,
  currency = 'ETH',
}: {
  amount: string | undefined
  network: number
  currency?: 'ETH' | 'USD'
}) => {
  return useQuery({
    queryKey: ['getEthPrice', amount, network, currency],
    queryFn: async () => {
      if (!amount) return null
      try {
        if (currency === 'ETH') {
          const response = await locksmith.price(network, parseFloat(amount))
          return response.data.result?.priceInAmount
        } else {
          const response = await locksmith.price(network, 1)
          const oneEthInUsd = response.data.result?.priceInAmount
          if (!oneEthInUsd) return null

          // Add 50 cents ($0.50) for gas fees when converting USD to ETH
          const amountWithPenny = parseFloat(amount) + 0.5
          return (amountWithPenny / oneEthInUsd).toFixed(6).toString()
        }
      } catch (error) {
        return null
      }
    },
    enabled: !!amount,
  })
}
