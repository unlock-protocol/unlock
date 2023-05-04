import { useQuery } from '@tanstack/react-query'
import { getFiatPricing } from './useCards'
import { useConfig } from '~/utils/withConfig'

interface CreditCardProps {
  lockAddress: string
  network: number
  quantity?: number
}

export const useGetCreditCardPricing = ({
  lockAddress,
  network,
}: CreditCardProps) => {
  const config = useConfig()

  return useQuery(['getCreditCardPricing', lockAddress, network], async () => {
    const keyPricing = await getFiatPricing(config, lockAddress, network)
    return keyPricing
  })
}
