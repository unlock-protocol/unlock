import { useQuery } from '@tanstack/react-query'
import { PaywallConfigType } from '@unlock-protocol/core'

import { getReferrers } from '~/utils/checkoutLockUtils'

export const useGetReferrers = (
  recipients: string[],
  paywallConfig: PaywallConfigType,
  lockAddress?: string
) => {
  return useQuery({
    queryKey: ['getReferrers', paywallConfig, lockAddress, recipients],
    queryFn: async () => {
      return getReferrers(recipients, paywallConfig, lockAddress)
    },
  })
}
