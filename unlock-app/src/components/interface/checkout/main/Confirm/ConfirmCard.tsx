import { CheckoutService } from './../checkoutMachine'
import { Connected } from '../../Connected'
import { useConfig } from '~/utils/withConfig'
import { Button, Detail } from '@unlock-protocol/ui'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { Fragment, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { useActor } from '@xstate/react'
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
import { useCapturePayment } from '~/hooks/useCapturePayment'
import { useCreditCardEnabled } from '~/hooks/useCreditCardEnabled'
import { PricingData } from './PricingData'
import { formatNumber } from '~/utils/formatter'
import { formatFiatPriceFromCents } from '../utils'
import { useGetTotalCharges } from '~/hooks/usePrice'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onConfirmed: (lock: string, hash?: string) => void
  onError: (message: string) => void
}

interface CreditCardPricingBreakdownProps {
  total: number
  creditCardProcessingFee?: number
  unlockServiceFee: number
  gasCosts?: number
  loading?: boolean
}

export function CreditCardPricingBreakdown({
  unlockServiceFee,
  total,
  creditCardProcessingFee,
  gasCosts,
  loading,
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
        <Detail
          loading={loading}
          className="flex justify-between w-full py-2 text-sm border-t border-gray-300"
          label="Service Fee"
          labelSize="tiny"
          valueSize="tiny"
          inline
        >
          <div className="font-normal">
            {formatFiatPriceFromCents(unlockServiceFee)}
          </div>
        </Detail>
        {!!creditCardProcessingFee && (
          <Detail
            loading={loading}
            className="flex justify-between w-full py-2 text-sm"
            label="Payment Processor"
            labelSize="tiny"
            valueSize="tiny"
            inline
          >
            <div className="font-normal">
              {formatFiatPriceFromCents(creditCardProcessingFee)}
            </div>
          </Detail>
        )}
        {!!gasCosts && (
          <Detail
            loading={loading}
            className="flex justify-between w-full py-2 text-sm"
            label="Gas Costs"
            labelSize="tiny"
            valueSize="tiny"
            inline
          >
            <div className="font-normal">
              {formatFiatPriceFromCents(gasCosts)}
            </div>
          </Detail>
        )}
        <Detail
          loading={loading}
          className="flex justify-between w-full py-2 text-sm border-t border-gray-300"
          label="Total"
          labelSize="tiny"
          valueSize="tiny"
          inline
        >
          <div className="font-normal">{formatFiatPriceFromCents(total)}</div>
        </Detail>
      </div>
    </div>
  )
}

export function ConfirmCard({
  injectedProvider,
  checkoutService,
  onConfirmed,
  onError,
}: Props) {
  const [state] = useActor(checkoutService)
  const config = useConfig()
  const [isConfirming, setIsConfirming] = useState(false)
  const { lock, recipients, payment, paywallConfig, metadata, data } =
    state.context

  const { address: lockAddress, network: lockNetwork } = lock!

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
      paywallConfig,
      recipients,
      data,
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

  const {
    data: totalPricing,
    isInitialLoading: isTotalPricingDataLoading,
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
    referrers: recipients.map((recipient) => getReferrer(recipient)),
    recipients,
  })

  const isLoading =
    isPricingDataLoading || isInitialDataLoading || isTotalPricingDataLoading

  const baseCurrencySymbol = config.networks[lockNetwork].nativeCurrency.symbol
  const symbol = lockTickerSymbol(lock as Lock, baseCurrencySymbol)

  const onConfirmCard = async () => {
    setIsConfirming(true)
    const referrers: string[] = recipients.map((recipient) => {
      return getReferrer(recipient, paywallConfig)
    })

    const stripeIntent = await createPurchaseIntent({
      pricing: totalPricing!.total,
      // @ts-expect-error Property 'cardId' does not exist on type '{ method: "card"; cardId?: string | undefined; }'.
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

    if (transactionHash) {
      onConfirmed(lockAddress, transactionHash)
    } else {
      onError('No transaction hash returned. Failed to claim membership.')
    }
    setIsConfirming(false)
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
            </div>
          )}
          {!isLoading && isPricingDataAvailable && (
            <PricingData
              network={lockNetwork}
              lock={lock!}
              pricingData={totalPricing}
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
          loading={isTotalPricingDataLoading || !isTotalPricingDataFetched}
          total={totalPricing?.total ?? 0}
          creditCardProcessingFee={totalPricing?.creditCardProcessingFee}
          unlockServiceFee={totalPricing?.unlockServiceFee ?? 0}
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
