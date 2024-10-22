import {
  CrossmintPaymentElement,
  useCrossmintEvents,
} from '@crossmint/client-sdk-react-ui'
import { CheckoutService } from './../checkoutMachine'
import { Fragment, useCallback, useState } from 'react'
import { useSelector } from '@xstate/react'
import { PoweredByUnlock } from '../../PoweredByUnlock'
import { Pricing } from '../../Lock'
import { getReferrer, lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { Lock } from '~/unlockTypes'
import { RiErrorWarningFill as ErrorIcon } from 'react-icons/ri'
import { usePricing } from '~/hooks/usePricing'
import { usePurchaseData } from '~/hooks/usePurchaseData'
import { ethers } from 'ethers'
import { useCrossmintEnabled } from '~/hooks/useCrossmintEnabled'
import { TransactionAnimation } from '../../Shell'
import { config } from '~/config/app'
import { useGetTokenIdForOwner } from '~/hooks/useGetTokenIdForOwner'
import Disconnect from '../Disconnect'
import { useAuthenticate } from '~/hooks/useAuthenticate'

interface Props {
  checkoutService: CheckoutService
  onConfirmed: (lock: string, network: number, hash?: string) => void
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
  onConfirmed,
  // onError,
  checkoutService,
}: Props) {
  const [error, setError] = useState<string | null>(null)
  const [crossmintLoading, setCrossmintLoading] = useState(true)
  const { account } = useAuthenticate()
  const { lock, recipients, paywallConfig, data, keyManagers, renew } =
    useSelector(checkoutService, (state) => state.context)
  const [isConfirming, setIsConfirming] = useState(false)
  const [quote, setQuote] = useState<CrossmintQuote | null>(null)

  const crossmintEnv = config.env === 'prod' ? 'production' : 'staging'

  const {
    isLoading: isCrossmintEnabledLoading,
    collectionId,
    projectId,
  } = useCrossmintEnabled({
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
    (paymentEvent: any) => {
      console.debug(paymentEvent)
      // We get the events from crossmint
      // https://docs.crossmint.com/docs/2c-embed-checkout-inside-your-ui#4-displaying-progress-success-and-errors-in-your-ui
      if (paymentEvent.type === 'payment:preparation.failed') {
        setError(
          `There was an error with Crossmint. ${paymentEvent.payload.error?.message}`
        )
      } else if (paymentEvent.type === 'quote:status.changed') {
        setCrossmintLoading(false)
        setQuote(paymentEvent.payload)
      } else if (paymentEvent.type === 'payment:process.started') {
        // Wait!
      } else if (paymentEvent.type === 'payment:process.succeeded') {
        setIsConfirming(true)
        listenToMintingEvents(paymentEvent.payload, (mintingEvent) => {
          if (mintingEvent.type === 'transaction:fulfillment.succeeded') {
            onConfirmed(lock!.address, lock!.network, mintingEvent.payload.txId)
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

  const { data: tokenId } = useGetTokenIdForOwner(
    { account: account!, lockAddress: lock!.address, network: lock!.network },
    {
      enabled: renew,
    }
  )

  const isLoading =
    !error &&
    (isCrossmintEnabledLoading ||
      isInitialDataLoading ||
      isPricingDataLoading ||
      crossmintLoading ||
      (!tokenId && renew))

  const referrers: string[] = recipients.map((recipient) => {
    return getReferrer(recipient, paywallConfig, lock!.address)
  })

  const values = pricingData
    ? [
        ethers.parseUnits(
          pricingData.prices[0].amount.toString(),
          pricingData.prices[0].decimals
        ),
      ]
    : []

  const argumentsReady =
    referrers && purchaseData && pricingData && (tokenId || !renew)

  // crossmint config
  const crossmintConfig = {
    emailInputOptions: {
      show: true,
    },
    recipient: {
      wallet: recipients[0], // Crossmint only supports a single recipient for now!
    },
    environment: crossmintEnv,
    mintConfig: {},
    onEvent: onCrossmintPaymentEvent,
    projectId,
    collectionId: '', // To be completed below!
  }

  if (!renew) {
    crossmintConfig.collectionId = collectionId
    crossmintConfig.mintConfig = {
      totalPrice: pricingData?.total.toString(),
      _values: values,
      _referrers: referrers,
      _keyManagers: keyManagers || recipients,
      _data: purchaseData,
    }
  } else {
    crossmintConfig.collectionId = [collectionId, 'extend'].join('-')
    crossmintConfig.mintConfig = {
      totalPrice: pricingData?.total.toString(),
      _tokenId: tokenId,
      _value: values[0],
      _referrer: referrers[0],
      _data: purchaseData ? purchaseData[0] : '',
    }
  }

  const showCrossmint = crossmintLoading || error ? 'hidden' : 'block'

  return (
    <Fragment>
      <main className="h-full p-6 space-y-2 overflow-auto">
        {!isConfirming && (
          <>
            <div className="grid gap-y-2">
              <h4 className="text-xl font-bold"> {lock!.name}</h4>

              {isPricingDataError && (
                // TODO: use actual error from simulation
                <div>
                  <p className="text-sm font-bold">
                    <ErrorIcon className="inline" />
                    There was an error when preparing the transaction.
                  </p>
                </div>
              )}
              {error && (
                <div>
                  <p className="text-sm font-bold">
                    <ErrorIcon className="inline" />
                    {error}
                  </p>
                </div>
              )}

              {!isLoading && (
                <div>
                  {quote?.lineItems.map((item: any, index: number) => {
                    const first = index <= 0

                    return (
                      <div key={index} className="text-sm ">
                        <div
                          className={`flex border-b ${
                            first ? 'border-t' : null
                          }  items-center justify-between px-0 py-2`}
                        >
                          <div className="w-64 truncate ...">
                            {item.metadata.description}
                          </div>{' '}
                          <div className="font-bold whitespace-nowrap">
                            {item.price.amount}{' '}
                            {item.price.currency.toUpperCase()}
                          </div>
                        </div>
                        {item.gasFee && (
                          <div
                            className={
                              'flex items-center justify-between px-0 py-2'
                            }
                          >
                            <div>Gas fee</div>
                            <div>{item.gasFee?.amount} USD </div>
                          </div>
                        )}
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
                keyPrice={`${
                  quote?.totalPrice.amount
                } ${quote?.totalPrice.currency.toUpperCase()}`}
                isCardEnabled={false}
              />
            )}
            {!isPricingDataError && argumentsReady && (
              <div className={`[&>iframe]:w-full ${showCrossmint} `}>
                <CrossmintPaymentElement {...crossmintConfig} />
              </div>
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
        <Disconnect service={checkoutService} />
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
