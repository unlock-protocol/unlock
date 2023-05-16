import { CheckoutService } from './../checkoutMachine'
import { Connected } from '../../Connected'
import { useConfig } from '~/utils/withConfig'
import { Button } from '@unlock-protocol/ui'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { Fragment, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { loadStripe } from '@stripe/stripe-js'
import { useActor } from '@xstate/react'
import { CheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { PoweredByUnlock } from '../../PoweredByUnlock'
import { Pricing } from '../../Lock'
import { getReferrer, lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { Lock } from '~/unlockTypes'
import { RiErrorWarningFill as ErrorIcon } from 'react-icons/ri'
import { ViewContract } from '../../ViewContract'
import { usePurchase } from '~/hooks/usePurchase'
import { useUpdateUsersMetadata } from '~/hooks/useUserMetadata'
import { usePricing } from '~/hooks/usePricing'
import { usePurchaseData } from '~/hooks/usePurchaseData'
import { useFiatChargePrice } from '~/hooks/useFiatChargePrice'
import { useCapturePayment } from '~/hooks/useCapturePayment'
import { useCreditCardEnabled } from '~/hooks/useCreditCardEnabled'
import { PricingData } from './PricingData'
import { formatNumber } from '~/utils/formatter'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  communication?: CheckoutCommunication
}

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

export function ConfirmCard({
  injectedProvider,
  checkoutService,
  communication,
}: Props) {
  const [state, send] = useActor(checkoutService)
  const config = useConfig()
  const [isConfirming, setIsConfirming] = useState(false)
  const {
    lock,
    recipients,
    payment,
    captcha,
    paywallConfig,
    password,
    promo,
    metadata,
  } = state.context

  const { address: lockAddress, network: lockNetwork } = lock!

  const currencyContractAddress = lock?.currencyContractAddress

  const recurringPayment =
    paywallConfig?.recurringPayments ||
    paywallConfig?.locks[lockAddress]?.recurringPayments

  const recurringPaymentAmount = recurringPayment
    ? Math.abs(Math.floor(Number(recurringPayment)))
    : undefined

  const { mutateAsync: createPurchaseIntent } = usePurchase({
    lockAddress,
    network: lockNetwork,
  })

  const { data: creditCardEnabled } = useCreditCardEnabled({
    lockAddress,
    network: lockNetwork,
  })

  const { mutateAsync: updateUsersMetadata } = useUpdateUsersMetadata()

  const { isInitialLoading: isInitialDataLoading, data: purchaseData } =
    usePurchaseData({
      lockAddress: lock!.address,
      network: lock!.network,
      promo,
      password,
      captcha,
      paywallConfig,
      recipients,
    })

  const {
    data: pricingData,
    isInitialLoading: isPricingDataLoading,
    isError: isPricingDataError,
  } = usePricing({
    lockAddress: lock!.address,
    network: lock!.network,
    recipients,
    currencyContractAddress: lock?.currencyContractAddress,
    data: purchaseData!,
    paywallConfig,
    enabled: !isInitialDataLoading,
    symbol: lockTickerSymbol(
      lock as Lock,
      config.networks[lock!.network].nativeCurrency.symbol
    ),
  })

  const isPricingDataAvailable =
    !isPricingDataLoading && !isPricingDataError && !!pricingData

  const amountToConvert = pricingData?.total || 0

  const { data: totalPricing, isInitialLoading: isTotalPricingDataLoading } =
    useFiatChargePrice({
      tokenAddress: currencyContractAddress,
      amount: amountToConvert,
      network: lock!.network,
      enabled: isPricingDataAvailable,
    })

  const { mutateAsync: capturePayment } = useCapturePayment({
    network: lock!.network,
    lockAddress: lock!.address,
    data: purchaseData,
    referrers: recipients.map((recipient) => getReferrer(recipient)),
    recipients,
  })

  const isLoading =
    isPricingDataLoading || isInitialDataLoading || isTotalPricingDataLoading

  const baseCurrencySymbol = config.networks[lockNetwork].nativeCurrency.symbol
  const symbol = lockTickerSymbol(lock as Lock, baseCurrencySymbol)

  const onError = (error: any, message?: string) => {
    console.error(error)
    switch (error.code) {
      case -32000:
      case 4001:
      case 'ACTION_REJECTED':
        ToastHelper.error('Transaction rejected.')
        break
      default:
        ToastHelper.error(message || error?.error?.message || error.message)
    }
  }

  const onConfirmCard = async () => {
    try {
      setIsConfirming(true)

      if (payment.method !== 'card') {
        return
      }

      const referrers: string[] = recipients.map((recipient) => {
        return getReferrer(recipient, paywallConfig)
      })

      const stripeIntent = await createPurchaseIntent({
        pricing: totalPricing!.total,
        stripeTokenId: payment.cardId!,
        recipients,
        referrers,
        data: purchaseData!,
        recurring: recurringPaymentAmount || 0,
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
          throw new Error('We could not confirm your payment.')
        }
      }
      const transactionHash = await capturePayment({
        paymentIntent: paymentIntent.id,
      })

      setIsConfirming(false)
      if (transactionHash) {
        send({
          type: 'CONFIRM_MINT',
          transactionHash,
          status: 'PROCESSING',
        })
        communication?.emitTransactionInfo({
          hash: transactionHash,
          lock: lockAddress,
        })
      }
    } catch (error) {
      send({
        type: 'CONFIRM_MINT',
        status: 'ERROR',
      })
      onError(error)
      setIsConfirming(false)
    }
  }

  return (
    <Fragment>
      <main className="h-full p-6 space-y-2 overflow-auto">
        <div className="grid gap-y-2">
          <div>
            <h4 className="text-xl font-bold"> {lock!.name}</h4>
            <ViewContract lockAddress={lock!.address} network={lockNetwork} />
          </div>
          {isPricingDataError && (
            // TODO: use actual error from simulation
            <div>
              <p className="text-sm font-bold">
                <ErrorIcon className="inline" />
                There was an error when preparing the transaction.
              </p>
              {password && (
                <p className="text-xs">
                  Please, check that the password you used is correct.
                </p>
              )}
            </div>
          )}
          {!isLoading && isPricingDataAvailable && (
            <PricingData
              network={lockNetwork}
              lock={lock!}
              pricingData={pricingData}
              payment={payment}
            />
          )}
        </div>
        {!isPricingDataAvailable && (
          <div>
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                {recipients.map((user) => (
                  <div
                    key={user}
                    className="w-full p-4 bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <Pricing
                keyPrice={
                  pricingData!.total <= 0
                    ? 'FREE'
                    : `${formatNumber(
                        pricingData!.total
                      ).toLocaleString()} ${symbol}`
                }
                usdPrice={
                  totalPricing?.total
                    ? `~${formatNumber(totalPricing?.total).toLocaleString()}`
                    : ''
                }
                isCardEnabled={!!creditCardEnabled}
              />
            )}
          </div>
        )}
        <CreditCardPricingBreakdown
          total={totalPricing!.total}
          creditCardProcessingFee={totalPricing!.creditCardProcessingFee}
          unlockServiceFee={totalPricing!.unlockServiceFee}
        />
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected
          injectedProvider={injectedProvider}
          service={checkoutService}
        >
          <div className="grid">
            <Button
              loading={isConfirming}
              disabled={isConfirming || isLoading}
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
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
