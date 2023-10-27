import {
  CrossmintCheckoutEventUnion,
  CrossmintPaymentElement,
  useCrossmintEvents,
} from '@crossmint/client-sdk-react-ui'
import { CheckoutService } from './../checkoutMachine'
import { Connected } from '../../Connected'
import { useConfig } from '~/utils/withConfig'
import { Fragment, useCallback, useState } from 'react'
import { useActor } from '@xstate/react'
import { PoweredByUnlock } from '../../PoweredByUnlock'
import { Pricing } from '../../Lock'
import { getReferrer, lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { Lock } from '~/unlockTypes'
import { RiErrorWarningFill as ErrorIcon } from 'react-icons/ri'
import { ViewContract } from '../../ViewContract'
import { usePricing } from '~/hooks/usePricing'
import { usePurchaseData } from '~/hooks/usePurchaseData'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ethers } from 'ethers'
import { useCrossmintEnabled } from '~/hooks/useCrossmintEnabled'
import { TransactionAnimation } from '../../Shell'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onConfirmed: (lock: string, hash?: string) => void
  onError: (message: string) => void
}

interface CrossmintQuote {
  lineItems: any[]
  totalPrice: {
    amount: string
    currency: string
  }
}

export function ConfirmCrossmint({
  injectedProvider,
  onConfirmed,
  // onError,
  checkoutService,
}: Props) {
  const { email } = useAuth()
  const [state] = useActor(checkoutService)
  const config = useConfig()
  const [isConfirming, setIsConfirming] = useState(false)
  const [quote, setQuote] = useState<CrossmintQuote | null>(null)
  const crossmintEnv = config.env === 'prod' ? 'production' : 'staging'

  const { lock, recipients, paywallConfig, data, keyManagers } = state.context

  const { isLoading: isCrossmintLoading, crossmintClientId } =
    useCrossmintEnabled({
      recipients,
      network: lock!.network,
      lockAddress: lock!.address,
    })

  const { isInitialLoading: isInitialDataLoading, data: purchaseData } =
    usePurchaseData({
      lockAddress: lock!.address,
      network: lock!.network,
      paywallConfig,
      recipients,
      data,
    })

  // Handling minting events
  const { listenToMintingEvents } = useCrossmintEvents({
    environment: crossmintEnv,
  })

  // Handling payment events
  const onCrossmintPaymentEvent = useCallback(
    (paymentEvent: CrossmintCheckoutEventUnion) => {
      console.debug(paymentEvent)
      // We get the events from crossmint
      // https://docs.crossmint.com/docs/2c-embed-checkout-inside-your-ui#4-displaying-progress-success-and-errors-in-your-ui
      if (paymentEvent.type === 'quote:status.changed') {
        setQuote(paymentEvent.payload)
      } else if (paymentEvent.type === 'payment:process.started') {
        // Wait!
      } else if (paymentEvent.type === 'payment:process.succeeded') {
        setIsConfirming(true)
        listenToMintingEvents(paymentEvent.payload, (mintingEvent) => {
          console.debug(mintingEvent)
          if (mintingEvent.type === 'transaction:fulfillment.succeeded') {
            onConfirmed(lock!.address, mintingEvent.payload.txId)
          }
        })
      }
    },
    [setQuote, onConfirmed, listenToMintingEvents, lock]
  )

  const {
    data: pricingData,
    isInitialLoading: isPricingDataLoading,
    isError: isPricingDataError,
  } = usePricing({
    lockAddress: lock!.address,
    network: lock!.network,
    recipients,
    currencyContractAddress: lock!.currencyContractAddress,
    data: purchaseData!,
    paywallConfig,
    enabled: !isInitialDataLoading,
    symbol: lockTickerSymbol(
      lock as Lock,
      config.networks[lock!.network].nativeCurrency.symbol
    ),
  })

  const isLoading =
    isCrossmintLoading || isInitialDataLoading || isPricingDataLoading || !quote

  const referrers: string[] = recipients.map((recipient) => {
    return getReferrer(recipient, paywallConfig, lock!.address)
  })

  const values = pricingData
    ? [
        ethers.utils.parseUnits(
          pricingData.prices[0].amount.toString(),
          pricingData.prices[0].decimals
        ),
      ]
    : []

  const argumentsReady = referrers && purchaseData && pricingData

  // crossmint config
  const crossmintConfig = {
    emailInputOptions: {
      show: !email,
    },
    recipient: {
      email,
      wallet: recipients[0], // Crossmint only supports a single recipient for now!
    },
    clientId: crossmintClientId!,
    environment: crossmintEnv,
    mintConfig: {
      totalPrice: pricingData?.total.toString(),
      _values: values,
      _referrers: referrers,
      _keyManagers: keyManagers || recipients,
      _data: purchaseData,
    },
    onEvent: onCrossmintPaymentEvent,
  }

  return (
    <Fragment>
      <main className="h-full p-6 space-y-2 overflow-auto">
        {!isConfirming && (
          <>
            <div className="grid gap-y-2">
              <div>
                <h4 className="text-xl font-bold"> {lock!.name}</h4>
                <ViewContract
                  lockAddress={lock!.address}
                  network={lock!.network}
                />
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

              {!isLoading && (
                <div>
                  {quote.lineItems.map((item: any, index: number) => {
                    const first = index <= 0

                    return (
                      <div
                        key={index}
                        className={`flex border-b ${
                          first ? 'border-t' : null
                        } items-center justify-between text-sm px-0 py-2`}
                      >
                        <div>{item.metadata.description}</div>{' '}
                        <div className="font-bold">
                          {item.price.amount}{' '}
                          {item.price.currency.toUpperCase()}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
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
            {quote?.totalPrice && (
              <Pricing
                keyPrice={`${quote?.totalPrice
                  .amount} ${quote?.totalPrice.currency.toUpperCase()}`}
                isCardEnabled={false}
              />
            )}
            {!isPricingDataError && argumentsReady && (
              <CrossmintPaymentElement {...crossmintConfig} />
            )}
          </>
        )}
        {isConfirming && (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <TransactionAnimation status={'PROCESSING'} />
            <p className="text-lg font-bold text-brand-ui-primary">
              Confirming payment
            </p>
          </div>
        )}
      </main>

      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected
          injectedProvider={injectedProvider}
          service={checkoutService}
        ></Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
