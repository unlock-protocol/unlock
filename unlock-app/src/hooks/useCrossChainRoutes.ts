import { useQuery } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { Lock } from '~/unlockTypes'
import { useAuth } from '~/contexts/AuthenticationContext'
import { purchasePriceFor } from './usePricing'
import { getReferrer } from '~/utils/checkoutLockUtils'
import { CrossChainRoute, getCrossChainRoutes } from '~/utils/theBox'
import { getAccountTokenBalance } from './useAccount'
import networks from '@unlock-protocol/networks'

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
  // For each of the networks, check the balance of the user on the native token, and then check the balance with the token
  // and then list all the tokens

  const { account } = useAuth()
  const web3Service = useWeb3Service()
  const { recipients, paywallConfig, keyManagers, renew } = context

  const { data: prices, isLoading: isLoadingPrices } = useQuery(
    ['prices', account, lock, recipients, purchaseData],
    async (): Promise => {
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
      return prices
    }
  )
  // ok so now we have the prices, let's get the balances of the native currencies

  const { data: balances, isLoading: isLoadingBalances } = useQuery(
    ['balances', account, networks],
    () => {}
  )

  //     const routes = await getCrossChainRoutes({
  //       sender: account!,
  //       lock,
  //       prices,
  //       recipients,
  //       keyManagers: keyManagers || recipients,
  //       referrers: recipients.map(() =>
  //         getReferrer(account!, paywallConfig, lock.address)
  //       ),
  //       purchaseData: purchaseData || recipients.map(() => '0x'),
  //     })

  //     // Async filter function
  //     const reduce = async (
  //       filteredRoutes: CrossChainRoute[],
  //       route: CrossChainRoute
  //     ): Promise<CrossChainRoute[]> => {
  //       const userBalance = await getAccountTokenBalance(
  //         web3Service,
  //         account!,
  //         null,
  //         route.network
  //       )
  //       if (ethers.parseEther(userBalance) >= route?.tx.value) {
  //         return [...(await filteredRoutes), ...[route]]
  //       }
  //       return filteredRoutes
  //     }

  //     // @ts-expect-error For some reason Typescript does not like that the type of the accumulator and the currnet value are different
  //     return routes
  //       .map((route) => {
  //         delete route.tx.gasLimit
  //         delete route.tx.maxFeePerGas
  //         delete route.tx.maxPriorityFeePerGas
  //         delete route.tx.gasPrice
  //         return route
  //       })
  //       .reduce<CrossChainRoute>(
  //         // @ts-expect-error For some reason Typescript does not like that the type of the accumulator and the currnet value are different
  //         reduce,
  //         [] as CrossChainRoute[]
  //       )
  //   },
  //   {
  //     enabled,
  //   }
  // )
}
