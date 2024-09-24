import { CheckoutService } from './../checkoutMachine'
import { useConfig } from '~/utils/withConfig'
import { Button, Detail } from '@unlock-protocol/ui'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { Fragment, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { useSelector } from '@xstate/react'
import { PoweredByUnlock } from '../../PoweredByUnlock'
import { Pricing } from '../../Lock'
import { getReferrer, lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { Lock } from '~/unlockTypes'
import { RiErrorWarningFill as ErrorIcon } from 'react-icons/ri'
import { usePurchase } from '~/hooks/usePurchase'
import { useUpdateUsersMetadata } from '~/hooks/useUserMetadata'
import { usePurchaseData } from '~/hooks/usePurchaseData'
import { useCapturePayment } from '~/hooks/useCapturePayment'
import { PricingData } from './PricingData'
import { formatNumber } from '~/utils/formatter'
import { formatFiatPrice, getNumberOfRecurringPayments } from '../utils'
import { useGetTotalCharges } from '~/hooks/usePrice'
import { useGetLockSettings } from '~/hooks/useLockSettings'
import { getCurrencySymbol } from '~/utils/currency'
import Disconnect from '../Disconnect'
import { ToastHelper } from '~/components/helpers/toast.helper'

interface Props {
  checkoutService: CheckoutService
  onConfirmed: (lock: string, network: number, hash?: string) => void
  onError: (message: string) => void
}

interface CreditCardPricingBreakdownProps {
  total: number
  creditCardProcessingFee?: number
  unlockServiceFee: number
  gasCosts?: number
  loading?: boolean
  symbol?: string
  unlockFeeChargedToUser?: boolean
}

export function CreditCardPricingBreakdown({
  unlockServiceFee,
  creditCardProcessingFee,
  gasCosts,
  loading,
  symbol = 'USD',
  unlockFeeChargedToUser = true,
  total,
}: CreditCardPricingBreakdownProps) {
  return (
    <div className="flex flex-col gap-2 pt-4 text-xs">
      <h3 className="font-medium">
        Credit Card Fees{' '}
        <a
          href="https://unlock-protocol.com/guides/enabling-credit-cards/#faq"
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-0.5 rounded-lg gap-2 hover:bg-gray-100 bg-gray-50 text-gray-500 hover:text-black"
        >
          <span>Learn more</span> <ExternalLinkIcon className="inline" />
        </a>
      </h3>
      <div>
        {unlockFeeChargedToUser && !loading && (
          <Detail
            loading={loading}
            className="flex justify-between w-full py-1 text-xs border-gray-300"
            label="Service Fee"
            labelSize="tiny"
            valueSize="tiny"
            inline
          >
            <div className="font-normal">
              {formatFiatPrice(unlockServiceFee, symbol)}
            </div>
          </Detail>
        )}
        {!!creditCardProcessingFee && (
          <Detail
            loading={loading}
            className="flex justify-between w-full py-1 text-sm"
            label="Payment Processor"
            labelSize="tiny"
            valueSize="tiny"
            inline
          >
            <div className="font-normal">
              {formatFiatPrice(creditCardProcessingFee, symbol)}
            </div>
          </Detail>
        )}
        {!!gasCosts && (
          <Detail
            loading={loading}
            className="flex justify-between w-full py-1 text-sm"
            label="Minting (gas) cost"
            labelSize="tiny"
            valueSize="tiny"
            inline
          >
            <div className="font-normal">
              {formatFiatPrice(gasCosts, symbol)}
            </div>
          </Detail>
        )}
        {total <= 0.5 && (
          <Detail
            loading={loading}
            className="flex justify-between w-full py-1"
            label="(The minimum charge is $0.50)"
            labelSize="tiny"
            valueSize="tiny"
            inline
          />
        )}
      </div>
    </div>
  )
}

export function ConfirmCard({ checkoutService, onConfirmed, onError }: Props) {
  const { lock, recipients, payment, paywallConfig, metadata, data, renew } =
    useSelector(checkoutService, (state) => state.context)
  const config = useConfig()
  const [isConfirming, setIsConfirming] = useState(false)

  const { address: lockAddress, network: lockNetwork } = lock!

  const recurringPayments = getNumberOfRecurringPayments(
    paywallConfig?.locks[lockAddress]?.recurringPayments ||
      paywallConfig?.recurringPayments
  )

  const { mutateAsync: createPurchaseIntent } = usePurchase({
    lockAddress,
    network: lockNetwork,
  })

  const { mutateAsync: updateUsersMetadata } = useUpdateUsersMetadata()

  const { isLoading: isInitialDataLoading, data: purchaseData } =
    usePurchaseData({
      lockAddress: lock!.address,
      network: lock!.network,
      paywallConfig,
      recipients,
      data,
    })

  const { data: { unlockFeeChargedToUser } = {} } = useGetLockSettings({
    network: lock!.network,
    lockAddress: lock!.address,
  })

  const { data: { creditCardCurrency = 'usd ' } = {} } = useGetLockSettings({
    lockAddress,
    network: lock!.network,
  })

  const creditCardCurrencySymbol = getCurrencySymbol(creditCardCurrency)

  const {
    data: totalPricing,
    isLoading: isTotalPricingDataLoading,
    isError: isTotalPricingDataError,
    isFetched: isTotalPricingDataFetched,
  } = useGetTotalCharges({
    recipients,
    lockAddress,
    network: lock!.network,
    purchaseData: purchaseData || [],
  })

  const { mutateAsync: capturePayment } = useCapturePayment({
    network: lock!.network,
    lockAddress: lock!.address,
    data: purchaseData,
    referrers: recipients.map((recipient: string) =>
      getReferrer(recipient, paywallConfig, lockAddress)
    ),
    recipients,
    purchaseType: renew ? 'extend' : 'purchase',
  })

  const isLoading = isInitialDataLoading || isTotalPricingDataLoading

  const baseCurrencySymbol = config.networks[lockNetwork].nativeCurrency.symbol
  const symbol = lockTickerSymbol(lock as Lock, baseCurrencySymbol)

  const onConfirmCard = async () => {
    setIsConfirming(true)
    try {
      const referrers: string[] = recipients.map((recipient) => {
        return getReferrer(recipient, paywallConfig, lockAddress)
      })

      const stripeIntent = await createPurchaseIntent({
        pricing: totalPricing!.total * 100, //
        // @ts-expect-error - generated types don't narrow down to the right type
        stripeTokenId: payment.cardId!,
        recipients,
        referrers,
        data: purchaseData!,
        recurring: recurringPayments,
      })

      if (!stripeIntent?.clientSecret) {
        throw new Error('Creating payment intent failed')
      }

      const stripe = await loadStripe(config.stripeApiKey, {
        stripeAccount: stripeIntent.stripeAccount,
      })

      if (!stripe) {
        throw new Error('There was a problem in loading stripe')
      }

      const { paymentIntent } = await stripe.retrievePaymentIntent(
        stripeIntent.clientSecret
      )

      if (!paymentIntent) {
        throw new Error('Payment intent is missing. Please retry.')
      }

      if (paymentIntent.status !== 'requires_capture') {
        const confirmation = await stripe.confirmCardPayment(
          stripeIntent.clientSecret
        )
        if (
          confirmation.error ||
          confirmation.paymentIntent?.status !== 'requires_capture'
        ) {
          onError(confirmation.error?.message || 'Failed to confirm payment')
          setIsConfirming(false)
          return
        }
      }

      const transactionHash = await capturePayment({
        paymentIntent: paymentIntent.id,
      })
      onConfirmed(lockAddress, lockNetwork, transactionHash)
    } catch (error) {
      console.error('Error while confirming card payment', error)
      ToastHelper.error(
        // @ts-expect-error Property 'response' does not exist on type '{}'.
        `There was an error when trying to perform the payment. You card was not charged. ${error?.response?.data?.error}`
      )
    }
    setIsConfirming(false)
  }

  return (
    <Fragment>
      <main className="h-full p-6 space-y-2 overflow-auto">
        <div className="grid gap-y-2">
          <h4 className="text-xl font-bold"> {lock!.name}</h4>

          {isTotalPricingDataError && (
            // TODO: use actual error from simulation
            <div>
              <p className="text-sm font-bold">
                <ErrorIcon className="inline" />
                There was an error when preparing the transaction.
              </p>
            </div>
          )}

          {/* Breakdown of each keys */}
          {!isLoading && totalPricing && (
            <PricingData
              network={lockNetwork}
              lock={lock!}
              prices={totalPricing.prices}
              payment={payment}
            />
          )}

          {/* Totals */}
          {isLoading && (
            <div className="flex flex-col items-center gap-2">
              {recipients.map((user) => (
                <div
                  key={user}
                  className="w-full p-4 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          )}

          {!isTotalPricingDataError && totalPricing && (
            <Pricing
              keyPrice={
                totalPricing.total <= 0
                  ? 'FREE'
                  : `${formatNumber(
                      totalPricing.total
                    ).toLocaleString()} ${symbol}`
              }
              usdPrice={formatFiatPrice(
                totalPricing!.total,
                creditCardCurrencySymbol
              )}
              isCardEnabled={true}
              extra={
                !isTotalPricingDataError &&
                totalPricing && (
                  <div className="border-b">
                    <CreditCardPricingBreakdown
                      loading={
                        isTotalPricingDataLoading || !isTotalPricingDataFetched
                      }
                      total={totalPricing?.total ?? 0}
                      creditCardProcessingFee={
                        totalPricing?.creditCardProcessingFee
                      }
                      unlockServiceFee={totalPricing?.unlockServiceFee ?? 0}
                      gasCosts={totalPricing?.gasCost}
                      symbol={creditCardCurrencySymbol}
                      unlockFeeChargedToUser={unlockFeeChargedToUser}
                    />
                  </div>
                )
              }
            />
          )}
        </div>
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <div className="grid">
          <Button
            loading={isConfirming}
            disabled={isConfirming || isLoading || isTotalPricingDataError}
            onClick={async (event) => {
              event.preventDefault()
              if (metadata) {
                await updateUsersMetadata(metadata)
              }
              onConfirmCard()
            }}
          >
            {isConfirming
              ? 'Paying using credit card'
              : 'Pay using credit card'}
          </Button>
        </div>
        <Disconnect service={checkoutService} />
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
