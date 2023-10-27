import { useQuery } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { Lock } from '~/unlockTypes'
import { useAuth } from '~/contexts/AuthenticationContext'
import { purchasePriceFor } from './usePricing'
import { getReferrer } from '~/utils/checkoutLockUtils'
import { CrossChainRoute, getCrossChainRoutes } from '~/utils/theBox'
import { getAccountTokenBalance } from './useAccount'

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

  const { recipients, paywallConfig, keyManagers, renew } = context

  return useQuery(
    ['crossChainRoutes', account, lock, recipients, purchaseData],
    async (): Promise<CrossChainRoute[]> => {
      // TODO: support renewals
      if (!purchaseData || !account || !lock || !recipients || renew) {
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

      const price = prices.reduce((acc, item) => acc + item.amount, 0)

      if (isNaN(price) || price === 0) {
        return []
      }

      const routes = await getCrossChainRoutes({
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

      // Async filter function
      const reduce = async (
        filteredRoutes: CrossChainRoute[],
        route: CrossChainRoute
      ): Promise<CrossChainRoute[]> => {
        const userBalance = await getAccountTokenBalance(
          web3Service,
          account!,
          null,
          route.network
        )
        if (ethers.utils.parseEther(userBalance).gte(route?.tx.value)) {
          return [...(await filteredRoutes), ...[route]]
        }
        return filteredRoutes
      }

      // @ts-expect-error For some reason Typescript does not like that the type of the accumulator and the currnet value are different
      return routes.reduce<CrossChainRoute>(
        // @ts-expect-error For some reason Typescript does not like that the type of the accumulator and the currnet value are different
        reduce,
        [] as CrossChainRoute[]
      )
    },
    {
      enabled,
    }
  )
}
