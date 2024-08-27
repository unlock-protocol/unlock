import { useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

interface CreditCardEnabledProps {
  lockAddress: string
  network: number
}

export const useCreditCardEnabled = ({
  lockAddress,
  network,
}: CreditCardEnabledProps) => {
  return useQuery({
    queryKey: ['useCreditCardEnabled', lockAddress, network],
    queryFn: async () => {
      const response = await locksmith.isCardPaymentEnabledForLock(
        network,
        lockAddress
      )

      return response?.data?.creditCardEnabled ?? false
    },
  })
}
