import { RiArrowRightLine as RightArrowIcon } from 'react-icons/ri'
import { CheckoutService } from './main/checkoutMachine'
import { AmountBadge } from './main/Payment'
import { useSelector } from '@xstate/react'
import { useEthPrice } from '~/hooks/useEthPrice'
import { useBaseRoute } from '~/hooks/useCrosschainBaseRoute'

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

  const { fundingAmount } = useBaseRoute({
    lock,
    recipients,
    keyManagers,
    paywallConfig,
    renew,
    data,
  })

  // get dollar equivalent to hint user
  const { data: ethPrice } = useEthPrice({
    amount: fundingAmount,
    network: 8453,
    currency: 'ETH',
  })

  // Don't render if routes are still loading or if there are cross-chain routes available
  if (isCrossChainRoutesLoading || hasCrossChainRoutes) {
    return null
  }

  if (enableCreditCard) {
    return null
  }

  if (!enableClaim) {
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
        <AmountBadge
          amount={ethPrice?.toString() || '0.00000'}
          symbol={'USD'}
        />
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
