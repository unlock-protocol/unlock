import { useActor } from '@xstate/react'
import { useFiatChargePrice } from '~/hooks/useFiatChargePrice'
import { CheckoutService } from '../checkoutMachine'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'

interface CreditCardPricingBreakdownProps {
  total: number
  creditCardProcessingFee: number
  unlockServiceFee: number
}

export function CreditCardPricingBreakdown({
  unlockServiceFee,
  total,
  creditCardProcessingFee,
}: CreditCardPricingBreakdownProps) {
  return (
    <div className="flex flex-col gap-2 pt-4 text-sm">
      <h3 className="font-medium">
        Credit Card Fees{' '}
        <a
          href="https://unlock-protocol.com/guides/enabling-credit-cards/#faq"
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-0.5 rounded-lg gap-2 text-xs hover:bg-gray-100 bg-gray-50 text-gray-500 hover:text-black"
        >
          <span>Learn more</span> <ExternalLinkIcon className="inline" />
        </a>
      </h3>
      <div className="divide-y">
        <div className="flex justify-between w-full py-2 text-sm border-t border-gray-300">
          <span className="text-gray-600">Service Fee</span>
          <div>
            $
            {(unlockServiceFee / 100).toLocaleString(undefined, {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            })}
          </div>
        </div>
        {!!creditCardProcessingFee && (
          <div className="flex justify-between w-full py-2 text-sm">
            <span className="text-gray-600"> Payment Processor </span>
            <div>
              $
              {(creditCardProcessingFee / 100).toLocaleString(undefined, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        )}
        <div className="flex justify-between w-full py-2 text-sm border-t border-gray-300">
          <span className="text-gray-600"> Total </span>
          <div className="font-bold">
            $
            {(total / 100).toLocaleString(undefined, {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

interface ConfirmCardProps {
  checkoutService: CheckoutService
  purchaseData: string[]
  pricingData: any
}

export const ConfirmCard = ({
  checkoutService,
  purchaseData,
  pricingData,
}: ConfirmCardProps) => {
  const [state] = useActor(checkoutService)

  const { lock } = state.context

  /**
   * Fiat details
   */
  const { data: totalPricing, isInitialLoading: isTotalPricingDataLoading } =
    useFiatChargePrice({
      tokenAddress: lock!.currencyContractAddress,
      amount: pricingData?.total || 0,
      network: lock!.network,
    })

  const isLoading = isTotalPricingDataLoading

  return (
    <div>
      {!isLoading && (
        <CreditCardPricingBreakdown
          total={totalPricing!.total}
          creditCardProcessingFee={totalPricing!.creditCardProcessingFee}
          unlockServiceFee={totalPricing!.unlockServiceFee}
        />
      )}
    </div>
  )
}
