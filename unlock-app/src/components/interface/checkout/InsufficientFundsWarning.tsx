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
import { ADDRESS_ZERO } from '~/constants'
import { useQuery } from '@tanstack/react-query'
import { getReferrer } from '~/utils/checkoutLockUtils'
import { purchasePriceFor } from '~/hooks/usePricing'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { CheckoutService } from './main/checkoutMachine'

interface InsufficientFundsWarningProps {
  enableCreditCard: boolean
  requiredAmount: string
  userAddress: string
  symbol: string
  onShowFundingContent?: (showing: boolean) => void
  currentBalance?: string
  isCrossChainRoutesLoading?: boolean
  hasCrossChainRoutes?: boolean
  lock: any
  purchaseData: string[]
  context: any
  checkoutService: CheckoutService
}

const InsufficientFundsWarning = ({
  enableCreditCard,
  requiredAmount,
  userAddress,
  onShowFundingContent,
  currentBalance,
  isCrossChainRoutesLoading,
  hasCrossChainRoutes,
  lock,
  purchaseData,
  context,
  checkoutService,
}: InsufficientFundsWarningProps) => {
  const [showFundingContent, setShowFundingContent] = useState(false)
  const web3Service = useWeb3Service()

  const { recipients, paywallConfig, keyManagers, renew } = context

  const { data: baseRoute } = useQuery({
    queryKey: ['prices', userAddress, lock, recipients, purchaseData],
    queryFn: async () => {
      if (!purchaseData || !userAddress || !lock || !recipients || renew) {
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

  const { fundWallet } = useFundWallet({
    onUserExited: async ({ balance }) => {
      // Format the balance from bigint to decimal string
      const formattedBalance = balance
        ? ethers.formatEther(balance.toString())
        : '0'

      // Get route amount based on the payment currency
      const requiredAmountInETH =
        baseRoute &&
        'tokenPayment' in baseRoute &&
        baseRoute.tokenPayment?.amount
          ? parseFloat(
              ethers.formatEther(baseRoute.tokenPayment.amount)
            ).toFixed(4)
          : requiredAmount

      if (Number(formattedBalance) < Number(requiredAmountInETH)) {
        handleSetShowFundingContent(false)
        onShowFundingContent?.(false)
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
    // Use route amount for any currency, with a small buffer for gas
    const fundingAmount =
      baseRoute && 'tokenPayment' in baseRoute && baseRoute.tokenPayment?.amount
        ? parseFloat(ethers.formatEther(baseRoute.tokenPayment.amount)).toFixed(
            4
          )
        : (Number(requiredAmount) + 0.0001).toString()

    await fundWallet(userAddress, {
      chain: base,
      amount: fundingAmount,
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

  // Don't render anything if balance is sufficient
  if (Number(currentBalance) >= Number(requiredAmount)) {
    return null
  }

  // Don't show funding content while routes are being checked
  if (showFundingContent && !isCrossChainRoutesLoading) {
    return (
      <div className="transition-opacity duration-300 ease-in-out flex flex-col items-center">
        <button
          onClick={() => handleSetShowFundingContent(false)}
          className="mb-2 text-sm font-medium text-red-500 hover:text-red-900"
        >
          Cancel
        </button>
        <div className="flex-1">
          <FundingContent open={true} />
        </div>
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
      className="mt-4 text-sm py-5 px-4 bg-red-200 rounded-lg border border-gray-200 cursor-pointer"
    >
      You don&apos;t have enough funds in your wallet to pay for this
      membership. Please add funds to your wallet to continue.
    </div>
  )
}

export default InsufficientFundsWarning
