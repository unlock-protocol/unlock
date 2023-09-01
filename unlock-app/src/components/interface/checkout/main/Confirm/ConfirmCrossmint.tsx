import { CrossmintPaymentElement } from '@crossmint/client-sdk-react-ui'
import { CheckoutService } from './../checkoutMachine'
import { Connected } from '../../Connected'
import { useConfig } from '~/utils/withConfig'
import { Fragment, useState } from 'react'
import { useActor } from '@xstate/react'
import { PoweredByUnlock } from '../../PoweredByUnlock'
import { Pricing } from '../../Lock'
import { getReferrer, lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { Lock } from '~/unlockTypes'
import { RiErrorWarningFill as ErrorIcon } from 'react-icons/ri'
import { ViewContract } from '../../ViewContract'
// import { useUpdateUsersMetadata } from '~/hooks/useUserMetadata'
import { usePricing } from '~/hooks/usePricing'
import { usePurchaseData } from '~/hooks/usePurchaseData'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ethers } from 'ethers'

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
  // onConfirmed,
  // onError,
  checkoutService,
}: Props) {
  const { account } = useAuth()
  const [state] = useActor(checkoutService)
  const config = useConfig()
  const [quote, setQuote] = useState<CrossmintQuote | null>(null)
  // const [isConfirming, setIsConfirming] = useState(false)
  const {
    lock,
    recipients,
    paywallConfig,
    // metadata, // Should we save it?
    data,
    keyManagers,
  } = state.context

  // const { mutateAsync: updateUsersMetadata } = useUpdateUsersMetadata()

  const { isInitialLoading: isInitialDataLoading, data: purchaseData } =
    usePurchaseData({
      lockAddress: lock!.address,
      network: lock!.network,
      paywallConfig,
      recipients,
      data,
    })

  const onCrossmintEvent = (event: any) => {
    // We get the events from crossmint
    // https://docs.crossmint.com/docs/2c-embed-checkout-inside-your-ui#4-displaying-progress-success-and-errors-in-your-ui
    console.log(event)
    if (event.type === 'quote:status.changed') {
      setQuote(event.payload)
    }
    //
    // onConfirmed
    // onError
  }

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

  const isLoading = isInitialDataLoading || isPricingDataLoading || !quote

  const referrers: string[] = recipients.map((recipient) => {
    return getReferrer(recipient, paywallConfig)
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

  return (
    <Fragment>
      <main className="h-full p-6 space-y-2 overflow-auto">
        <div className="grid gap-y-2">
          <div>
            <h4 className="text-xl font-bold"> {lock!.name}</h4>
            <ViewContract lockAddress={lock!.address} network={lock!.network} />
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
                      {item.price.amount} {item.price.currency.toUpperCase()}
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
          <CrossmintPaymentElement
            recipient={{
              wallet: account,
            }}
            // We should get this from the lock's settings
            clientId="1d837cfc-6299-47b4-b5f9-462d5df00f33"
            // change to prod?
            environment="staging"
            mintConfig={{
              //  TODO: add recipient address here!
              totalPrice: pricingData?.total.toString(),
              _values: values,
              _referrers: referrers,
              _keyManagers: keyManagers || recipients,
              _data: purchaseData,
            }}
            currency="USD" // USD only, more coming soon
            locale="en-US" // en-US only, more coming soon
            onEvent={onCrossmintEvent}
          />
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
