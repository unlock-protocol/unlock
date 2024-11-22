import { useState } from 'react'
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
import { RiArrowRightLine as RightArrowIcon } from 'react-icons/ri'
import { ADDRESS_ZERO } from '~/constants'
import { useQuery } from '@tanstack/react-query'
import { getReferrer } from '~/utils/checkoutLockUtils'
import { purchasePriceFor } from '~/hooks/usePricing'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { CheckoutService } from './main/checkoutMachine'
import { Button } from '@unlock-protocol/ui'

interface InsufficientFundsWarningProps {
  enableCreditCard: boolean
  userAddress: string
  onShowFundingContent?: (showing: boolean) => void
  isCrossChainRoutesLoading?: boolean
  hasCrossChainRoutes?: boolean
  lock: any
  purchaseData: string[]
  context: any
  checkoutService: CheckoutService
}

const InsufficientFundsWarning = ({
  enableCreditCard,
  userAddress,
  onShowFundingContent,
  isCrossChainRoutesLoading,
  hasCrossChainRoutes,
  lock,
  purchaseData,
  context,
  checkoutService,
}: InsufficientFundsWarningProps) => {
  const [showFundingContent, setShowFundingContent] = useState(false)
  const web3Service = useWeb3Service()
  // hardcoded till relay provides gas estimates
  const GAS_COST = 0.0001

  const { recipients, paywallConfig, keyManagers, renew } = context

  const { data: baseRoute } = useQuery({
    queryKey: [
      'getRouteToFundWallet',
      userAddress,
      lock,
      recipients,
      purchaseData,
    ],
    queryFn: async () => {
      if (!purchaseData || !userAddress || !lock || !recipients || renew) {
        return null
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
        return null
      }

      const sharedParams = await prepareSharedParams({
        lock,
        prices: prices!,
        recipients,
        keyManagers: keyManagers || recipients,
        referrers: recipients.map(() =>
          getReferrer(userAddress, paywallConfig, lock.address)
        ),
        purchaseData,
      })

      const route = await relayGetCrossChainRoute({
        sender: userAddress,
        lock,
        prices: prices!,
        srcToken: ADDRESS_ZERO,
        recipients,
        keyManagers: keyManagers || recipients,
        referrers: recipients.map(() =>
          getReferrer(userAddress, paywallConfig, lock.address)
        ),
        purchaseData,
        // always use the base chain
        srcChainId: 8453,
        sharedParams: sharedParams!,
      })

      return route
    },
    staleTime: 1000 * 60 * 5,
  })

  // funding amount is the amount of the token payment + estimated gas cost
  const fundingAmount = baseRoute?.tokenPayment?.amount
    ? parseFloat(ethers.formatEther(baseRoute.tokenPayment.amount)) + GAS_COST
    : null

  const { fundWallet } = useFundWallet({
    onUserExited: async ({ balance }) => {
      const formattedBalance = balance
        ? ethers.formatEther(balance.toString())
        : '0'

      if (Number(formattedBalance) < (fundingAmount ?? 0)) {
        handleSetShowFundingContent(true)
        onShowFundingContent?.(true)
        return
      }

      checkoutService.send({
        type: 'SELECT_PAYMENT_METHOD',
        payment: {
          method: 'crosschain_purchase',
          route: baseRoute,
        },
      })

      handleSetShowFundingContent(false)
      onShowFundingContent?.(false)
    },
  })

  const handleFundWallet = async () => {
    if (!fundingAmount) {
      throw new Error('Token payment amount is required.')
    }

    await fundWallet(userAddress, {
      chain: base,
      amount: fundingAmount.toFixed(5).toString(),
    })
  }

  // Handle rendering of the funding content
  const handleSetShowFundingContent = (show: boolean) => {
    setShowFundingContent(show)
    onShowFundingContent?.(show)
  }

  // Don't render if routes are still loading or if there are cross-chain routes available
  if (isCrossChainRoutesLoading || hasCrossChainRoutes) {
    return null
  }

  // Don't show funding content while routes are being checked
  if (showFundingContent && !isCrossChainRoutesLoading) {
    return (
      <div className="transition-opacity duration-300 ease-in-out flex flex-col items-center">
        <div className="flex-1">
          <FundingContent open={true} />
        </div>

        <Button
          className="w-full mt-5 bg-red-500"
          onClick={() => handleSetShowFundingContent(false)}
        >
          Cancel
        </Button>
      </div>
    )
  }
  if (enableCreditCard) {
    return null
  }

  return (
    <div
      onClick={() => {
        handleSetShowFundingContent(true)
        handleFundWallet()
      }}
      className="mt-5 grid w-full p-4 space-y-2 text-left text-black border bg-red-100 border-gray-400 rounded-lg gap-y-2 shadow cursor-pointer group hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
    >
      Fund your account
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center w-full text-sm text-left text-gray-500">
          You don&apos;t have enough funds in your account to pay for this.
          Please add funds to continue.
        </div>
        <RightArrowIcon
          className="transition-transform duration-300 ease-out group-hover:fill-brand-ui-primary group-hover:translate-x-1 group-disabled:translate-x-0 group-disabled:transition-none group-disabled:group-hover:fill-black"
          size={20}
        />
      </div>
    </div>
  )
}

export default InsufficientFundsWarning
