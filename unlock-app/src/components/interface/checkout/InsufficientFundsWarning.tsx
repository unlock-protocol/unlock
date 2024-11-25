import { RiArrowRightLine as RightArrowIcon } from 'react-icons/ri'
import { CheckoutService } from './main/checkoutMachine'

interface InsufficientFundsWarningProps {
  enableCreditCard: boolean
  isCrossChainRoutesLoading?: boolean
  hasCrossChainRoutes?: boolean
  checkoutService: CheckoutService
}

const InsufficientFundsWarning = ({
  enableCreditCard,
  isCrossChainRoutesLoading,
  hasCrossChainRoutes,
  checkoutService,
}: InsufficientFundsWarningProps) => {
  // Don't render if routes are still loading or if there are cross-chain routes available
  if (isCrossChainRoutesLoading || hasCrossChainRoutes) {
    return null
  }

  if (enableCreditCard) {
    return null
  }

  return (
    <div
      onClick={() => {
        checkoutService.send({
          type: 'PRIVY_FUNDING',
        })
      }}
      className="mt-5 grid w-full p-4 text-left border border-gray-400 rounded-lg shadow cursor-pointer group hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
    >
      Fund your account
      <div className="flex mt-1 items-center justify-between w-full">
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
