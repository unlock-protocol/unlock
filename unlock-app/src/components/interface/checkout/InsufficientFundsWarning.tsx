import { RiArrowRightLine as RightArrowIcon } from 'react-icons/ri'
import { CheckoutService } from './main/checkoutMachine'
import { AmountBadge } from './main/Payment'
import { useSelector } from '@xstate/react'
import { useEthPrice } from '~/hooks/useEthPrice'
import { useBaseRoute } from '~/hooks/useCrosschainBaseRoute'
import { Placeholder } from '@unlock-protocol/ui'

interface InsufficientFundsWarningProps {
  enableCreditCard: boolean
  enableClaim: boolean
  isCrossChainRoutesLoading?: boolean
  hasCrossChainRoutes?: boolean
  checkoutService: CheckoutService
}

const InsufficientFundsWarning = ({
  enableCreditCard,
  enableClaim,
  isCrossChainRoutesLoading,
  hasCrossChainRoutes,
  checkoutService,
}: InsufficientFundsWarningProps) => {
  const { recipients, paywallConfig, keyManagers, lock, renew, data } =
    useSelector(checkoutService, (state) => state.context)

  const { fundingAmount, isLoading: isBaseRouteLoading } = useBaseRoute({
    lock,
    recipients,
    keyManagers,
    paywallConfig,
    renew,
    data,
  })

  // get dollar equivalent to hint user
  const { data: ethPrice, isPending: isEthPricePending } = useEthPrice({
    amount: fundingAmount,
    network: 8453,
    currency: 'ETH',
  })

  // Don't render if any of these conditions are true
  if (
    enableCreditCard || // Credit card payment is available
    enableClaim || // Can claim for free
    isCrossChainRoutesLoading || // Still loading cross-chain routes
    isBaseRouteLoading || // Still loading base route
    hasCrossChainRoutes || // Has available cross-chain routes
    !fundingAmount || // No funding amount available
    Number(fundingAmount) <= 0 // Invalid funding amount
  ) {
    return null
  }

  return (
    <button
      onClick={(event) => {
        event.preventDefault()
        checkoutService.send({
          type: 'PRIVY_FUNDING',
        })
      }}
      className="mt-5 grid w-full p-4 space-y-2 text-left border border-gray-400 rounded-lg shadow cursor-pointer group hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
    >
      <div className="flex justify-between w-full">
        <h3 className="font-bold">Fund your account</h3>
        {!isEthPricePending && ethPrice ? (
          <AmountBadge amount={ethPrice.toString()} symbol={'USD'} />
        ) : (
          <Placeholder.Line className="max-w-32" />
        )}
      </div>
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
    </button>
  )
}

export default InsufficientFundsWarning
