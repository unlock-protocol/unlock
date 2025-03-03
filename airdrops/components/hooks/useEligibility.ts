import { isEligible } from '../../src/utils/eligibility'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useQuery } from '@tanstack/react-query'
import { hasClaimed } from '../CampaignDetailContent'

export const useEligibility = (airdrop) => {
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()

  return useQuery({
    queryKey: ['useEligibility', wallets, airdrop],
    queryFn: async () => {
      const eligible = await isEligible(wallets[0].address, airdrop)
      if (eligible) {
        const wasClaimed = await hasClaimed(
          wallets[0].address,
          eligible,
          airdrop
        )
        if (wasClaimed) {
          return { eligible, claimed: true }
        }
      }
      return { eligible, wasClaimed: false }
    },
    initialData: { eligible: '0', wasClaimed: false },
    enabled: !!(authenticated && wallets[0]),
    refetchOnWindowFocus: false,
  })
}
