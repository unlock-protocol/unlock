import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useQuery } from '@tanstack/react-query'
import { AirdropData } from '../Campaigns'
import { isEligible } from '../../src/utils/eligibility'
import { hasClaimed } from '../CampaignDetailContent'
import { hasDelegated } from '../../src/utils/delegation'

export function useDelegation(airdrop: AirdropData) {
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()

  return useQuery({
    queryKey: ['useDelegation', wallets, airdrop],
    queryFn: async () => {
      const address = wallets[0].address
      const eligibleAmount = await isEligible(address, airdrop)
      const alreadyClaimed =
        eligibleAmount !== '0'
          ? await hasClaimed(address, eligibleAmount, airdrop)
          : false

      const delegationStatus =
        eligibleAmount !== '0'
          ? await hasDelegated(
              address,
              airdrop.token?.address || '',
              airdrop.chainId
            )
          : false

      const canClaim =
        eligibleAmount !== '0' && !alreadyClaimed && delegationStatus

      return {
        eligible: eligibleAmount,
        claimed: alreadyClaimed,
        hasDelegated: delegationStatus,
        canClaim,
      }
    },
    initialData: {
      eligible: '0',
      claimed: false,
      hasDelegated: false,
      canClaim: false,
    },
    enabled: !!(authenticated && wallets?.[0]),
    refetchOnWindowFocus: false,
  })
}
