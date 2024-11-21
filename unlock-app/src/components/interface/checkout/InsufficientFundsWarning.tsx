import { useState } from 'react'
import {
  LoginModal as FundingContent,
  useFundWallet,
} from '@privy-io/react-auth'
import { base } from 'viem/chains'
import { useEthPrice } from '~/hooks/useEthPrice'
import { ethers } from 'ethers'

interface InsufficientFundsWarningProps {
  enableCreditCard: boolean
  requiredAmount: string
  userAddress: string
  symbol: string
  onBalanceCheck: () => Promise<any>
  onShowFundingContent?: (showing: boolean) => void
  currentBalance?: string
  onRefetchRoutes?: () => Promise<any>
  isCrossChainRoutesLoading?: boolean
  hasCrossChainRoutes?: boolean
}

const InsufficientFundsWarning = ({
  enableCreditCard,
  requiredAmount,
  userAddress,
  symbol,
  onBalanceCheck,
  onShowFundingContent,
  currentBalance,
  onRefetchRoutes,
  isCrossChainRoutesLoading,
  hasCrossChainRoutes,
}: InsufficientFundsWarningProps) => {
  const [showFundingContent, setShowFundingContent] = useState(false)

  // Get ETH price conversion if needed
  const { data: priceInETH } = useEthPrice({
    amount: requiredAmount,
    network: base.id,
    currency: symbol === 'USDC' ? 'USD' : 'ETH',
  })

  const { fundWallet } = useFundWallet({
    onUserExited: async ({ balance }) => {
      // Format the balance from bigint to decimal string
      const formattedBalance = balance
        ? ethers.formatEther(balance.toString())
        : '0'

      // For both USDC and ETH payments, we compare against ETH values
      const requiredAmountInETH =
        symbol === 'USDC' ? priceInETH?.toString() : requiredAmount

      if (Number(formattedBalance) < Number(requiredAmountInETH)) {
        // If still insufficient, keep warning visible
        handleSetShowFundingContent(false)
        onShowFundingContent?.(false)
        return
      }

      // Check balance after funding
      await onBalanceCheck().catch(console.error)

      // Refetch cross-chain routes
      if (onRefetchRoutes) {
        await onRefetchRoutes().catch(console.error)
      }

      // Hide modals while we wait for routes to be checked
      handleSetShowFundingContent(false)
      onShowFundingContent?.(false)
    },
  })

  const handleFundWallet = async () => {
    // If paying in USDC, we need to convert to ETH equivalent for funding
    const fundingAmount =
      symbol === 'USDC'
        ? priceInETH?.toString()
        : (Number(requiredAmount) + 0.0001).toString() // Add small buffer for gas

    await fundWallet(userAddress, {
      // always use the base chain
      chain: base,
      amount: fundingAmount,
    })
  }

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

  // Don't show login modal content while routes are being checked
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

  return (
    <div
      onClick={() => {
        if (!enableCreditCard) {
          handleSetShowFundingContent(true)
          handleFundWallet()
        }
      }}
      className="mt-4 text-sm py-5 px-4 bg-red-200 rounded-lg border border-gray-200 cursor-pointer"
    >
      You don&apos;t have enough funds in your wallet to pay for this
      membership.{' '}
      {enableCreditCard
        ? 'You can proceed to pay with a credit card.'
        : 'Please add funds to your wallet to continue.'}
    </div>
  )
}

export default InsufficientFundsWarning
