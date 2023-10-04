import { useQuery } from '@tanstack/react-query'

import { useWeb3Service } from '~/utils/withWeb3Service'
import { Lock, PaywallConfig } from '~/unlockTypes'
import { useAuth } from '~/contexts/AuthenticationContext'
import { purchasePriceFor } from './usePricing'
import { getReferrer } from '~/utils/checkoutLockUtils'
import { getCrossChainRoutes } from '~/utils/theBox'

interface CrossChainRoutesOption {
  lock: Lock
  purchaseData: string[] | undefined
  context: any
  enabled: boolean
}

export const useCrossChainRoutes = ({
  lock,
  purchaseData,
  context,
  enabled = true,
}: CrossChainRoutesOption) => {
  const { account } = useAuth()
  const web3Service = useWeb3Service()

  const { recipients, paywallConfig, keyManagers } = context

  return useQuery(
    ['crossChainRoutes', account, lock, recipients, purchaseData],
    async () => {
      if (!purchaseData || !account || !lock || !recipients) {
        return []
      }

      const prices = await purchasePriceFor(web3Service, {
        lockAddress: lock.address,
        network: lock.network,
        recipients,
        data: purchaseData || recipients.map(() => ''),
        paywallConfig,
        currencyContractAddress: lock.currencyContractAddress,
        symbol: lock.currencySymbol,
      })

      return getCrossChainRoutes({
        sender: account!,
        lock,
        prices,
        recipients,
        keyManagers: keyManagers || recipients,
        referrers: recipients.map(() =>
          getReferrer(account!, paywallConfig, lock.address)
        ),
        purchaseData: purchaseData || recipients.map(() => '0x'),
      })
    },
    {
      enabled,
    }
  )
}
