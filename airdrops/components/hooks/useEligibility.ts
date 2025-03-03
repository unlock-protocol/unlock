import { isEligible } from '../../src/utils/eligibility'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useQuery } from '@tanstack/react-query'

export const useEligibility = (airdrop) => {
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()

  return useQuery({
    queryKey: ['useEligibility', wallets, airdrop],
    queryFn: () => {
      return isEligible(wallets[0].address, airdrop)
    },
    enabled: !!(authenticated && wallets[0]),
    refetchOnWindowFocus: false,
  })
}
