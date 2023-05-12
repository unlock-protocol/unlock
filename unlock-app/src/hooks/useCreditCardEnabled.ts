import { useQuery } from '@tanstack/react-query'
import { storage } from '~/config/storage'

interface CreditCardEnabledProps {
  lockAddress: string
  network: number
}

export const useCreditCardEnabled = ({
  lockAddress,
  network,
}: CreditCardEnabledProps) => {
  return useQuery(['useCreditCardEnabled', lockAddress, network], async () => {
    const response = await storage.isCardPaymentEnabledForLock(
      network,
      lockAddress
    )

    return response?.data?.creditCardEnabled ?? false
  })
}
