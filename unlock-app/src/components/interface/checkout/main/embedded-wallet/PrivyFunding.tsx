import { useEffect, Fragment } from 'react'
import {
  LoginModal as FundingContent,
  useFundWallet,
} from '@privy-io/react-auth'
import { base } from 'viem/chains'
import { ethers } from 'ethers'
import {
  getCrossChainRoute as relayGetCrossChainRoute,
  prepareSharedParams,
} from '~/utils/relayLink'
import { ADDRESS_ZERO } from '~/constants'
import { useQuery } from '@tanstack/react-query'
import { getReferrer } from '~/utils/checkoutLockUtils'
import { purchasePriceFor } from '~/hooks/usePricing'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { CheckoutService } from '../checkoutMachine'
import { useSelector } from '@xstate/react'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { Stepper } from '../../Stepper'
import { Button, Placeholder } from '@unlock-protocol/ui'
import { PoweredByUnlock } from '../../PoweredByUnlock'
import { usePurchaseData } from '~/hooks/usePurchaseData'

interface PrivyFundingProps {
  checkoutService: CheckoutService
}

const PrivyFunding = ({ checkoutService }: PrivyFundingProps) => {
  const web3Service = useWeb3Service()
  const { account: userAddress } = useAuthenticate()
  // hardcoded till relay provides gas estimates
  const GAS_COST = 0.0001

  const { recipients, paywallConfig, keyManagers, lock, renew, data } =
    useSelector(checkoutService, (state) => state.context)

  const { isLoading: isInitialDataLoading, data: purchaseData } =
    usePurchaseData({
      lockAddress: lock!.address,
      network: lock!.network,
      paywallConfig,
      recipients,
      data,
    })

  const { data: baseRoute, isLoading: isBaseRouteLoading } = useQuery({
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
        // always use the base chain
        srcChainId: 8453,
        sharedParams: sharedParams!,
      })

      return route
    },
    enabled: !isInitialDataLoading && !!purchaseData,
    staleTime: 1000 * 60 * 5,
  })

  const fundingAmount = baseRoute?.tokenPayment?.amount
    ? parseFloat(ethers.formatEther(baseRoute.tokenPayment.amount)) + GAS_COST
    : null

  const { fundWallet } = useFundWallet({
    onUserExited: async () => {
      checkoutService.send({
        type: 'SELECT_PAYMENT_METHOD',
        payment: {
          method: 'crosschain_purchase',
          route: baseRoute,
        },
      })
    },
  })

  const handleFundWallet = async () => {
    if (!fundingAmount) {
      throw new Error('Token payment amount is required.')
    }

    await fundWallet(userAddress!, {
      chain: base,
      amount: fundingAmount.toFixed(5).toString(),
    })
  }

  useEffect(() => {
    if (baseRoute) {
      handleFundWallet()
    }
  }, [baseRoute])

  if (isBaseRouteLoading) {
    return (
      <Fragment>
        <Stepper service={checkoutService} />
        <main className="h-full px-6 py-4 overflow-auto">
          <Placeholder.Root>
            <Placeholder.Card />
          </Placeholder.Root>
        </main>
        <footer className="grid items-center px-6 pt-6 border-t">
          <Button disabled={true} className="w-full">
            Next
          </Button>

          <PoweredByUnlock />
        </footer>
      </Fragment>
    )
  }

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      <main className="h-full px-6 pb-4 overflow-auto">
        <div className="transition-opacity duration-300 ease-in-out flex flex-col items-center">
          <div className="flex-1">
            <FundingContent open={true} />
          </div>
        </div>
      </main>
    </Fragment>
  )
}

export default PrivyFunding
