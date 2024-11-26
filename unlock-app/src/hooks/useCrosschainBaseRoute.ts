import { useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { ADDRESS_ZERO } from '~/constants'
import { getReferrer } from '~/utils/checkoutLockUtils'
import { purchasePriceFor } from '~/hooks/usePricing'
import {
  getCrossChainRoute as relayGetCrossChainRoute,
  prepareSharedParams,
} from '~/utils/relayLink'
import { usePurchaseData } from '~/hooks/usePurchaseData'
import { ethers } from 'ethers'

// hardcoded till relay provides gas estimates
const GAS_COST = 0.0001

export const useBaseRoute = ({
  lock,
  recipients,
  keyManagers,
  paywallConfig,
  renew,
  data,
}: Partial<any>) => {
  const web3Service = useWeb3Service()
  const { account: userAddress } = useAuthenticate()

  const { data: purchaseData, isLoading: isPurchaseDataLoading } =
    usePurchaseData({
      lockAddress: lock?.address,
      network: lock?.network,
      paywallConfig,
      recipients,
      data,
    })

  const result = useQuery({
    queryKey: ['getRouteToFundWallet', lock, recipients, purchaseData],
    queryFn: async () => {
      if (!recipients || !lock || renew || !purchaseData) {
        return null
      }

      const prices = await purchasePriceFor(web3Service, {
        lockAddress: lock.address,
        network: lock.network,
        recipients,
        data: recipients.map(() => ''),
        paywallConfig,
        currencyContractAddress: lock.currencyContractAddress,
        symbol: lock.currencySymbol,
      })

      const price = prices.reduce((acc, item) => acc + item.amount, 0)
      if (isNaN(price) || price === 0) {
        return null
      }

      const sharedParams = await prepareSharedParams({
        lock,
        prices: prices!,
        recipients,
        keyManagers: keyManagers || recipients,
        referrers: recipients.map(() =>
          getReferrer(userAddress!, paywallConfig, lock.address)
        ),
        purchaseData: purchaseData!,
      })

      const route = await relayGetCrossChainRoute({
        sender: userAddress!,
        lock,
        prices: prices!,
        srcToken: ADDRESS_ZERO,
        recipients,
        keyManagers: keyManagers || recipients,
        referrers: recipients.map(() =>
          getReferrer(userAddress!, paywallConfig, lock.address)
        ),
        purchaseData: purchaseData!,
        srcChainId: 8453,
        sharedParams: sharedParams!,
      })

      return route
    },
    enabled: !!purchaseData && !isPurchaseDataLoading,
    staleTime: 1000 * 60 * 5,
  })

  const fundingAmount = result.data?.tokenPayment?.amount
    ? (
        parseFloat(ethers.formatEther(result.data.tokenPayment.amount)) +
        GAS_COST
      ).toFixed(5)
    : '0.00000'

  return {
    ...result,
    fundingAmount,
    GAS_COST,
  }
}
