import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './../checkoutMachine'
import { Connected } from '../../Connected'
import { useConfig } from '~/utils/withConfig'
import { Button } from '@unlock-protocol/ui'
import { Fragment, useRef, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import { PoweredByUnlock } from '../../PoweredByUnlock'
import { Pricing } from '../../Lock'
import { lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { Lock } from '~/unlockTypes'
import ReCaptcha from 'react-google-recaptcha'
import { RiErrorWarningFill as ErrorIcon } from 'react-icons/ri'
import { ViewContract } from '../../ViewContract'
import { useUpdateUsersMetadata } from '~/hooks/useUserMetadata'
import { usePricing } from '~/hooks/usePricing'
import { usePurchaseData } from '~/hooks/usePurchaseData'
import { formatNumber } from '~/utils/formatter'
import { PricingData } from './PricingData'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onConfirmed: (lock: string, hash?: string, network?: number) => void
  onError: (message: string) => void
}

export function ConfirmCrossChainPurchase({
  injectedProvider,
  checkoutService,
  onConfirmed,
}: Props) {
  const [state] = useActor(checkoutService)
  const { getWalletService } = useAuth()
  const config = useConfig()
  const recaptchaRef = useRef<any>()
  const [isConfirming, setIsConfirming] = useState(false)
  const { lock, recipients, payment, paywallConfig, metadata, data } =
    state.context

  const { address: lockAddress, network: lockNetwork } = lock!

  // @ts-expect-error Property 'route' does not exist on type '{ method: "card"; cardId?: string | undefined; }'.
  const route = payment.route

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
    payment,
  })

  const isPricingDataAvailable =
    !isPricingDataLoading && !isPricingDataError && !!pricingData

  const isLoading = isPricingDataLoading || isInitialDataLoading

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

  const onConfirm = async () => {
    if (!pricingData) {
      return
    }
    try {
      setIsConfirming(true)
      const walletService = await getWalletService(route.network)
      const tx = await walletService.signer.sendTransaction(route.tx)
      onConfirmed(lockAddress, tx.hash, route.network)
    } catch (error: any) {
      setIsConfirming(false)
      onError(error)
    }
  }

  let buttonLabel = ''
  if (isConfirming) {
    buttonLabel = 'Paying using crypto'
  } else {
    buttonLabel = 'Pay using crypto'
  }

  return (
    <Fragment>
      <ReCaptcha
        ref={recaptchaRef}
        sitekey={config.recaptchaKey}
        size="invisible"
        badge="bottomleft"
      />

      <main className="h-full p-6 space-y-2 overflow-auto">
        <div className="grid gap-y-2">
          <div>
            <h4 className="text-xl font-bold"> {lock!.name}</h4>
            <ViewContract lockAddress={route.tx.to} network={route.network} />
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
              pricingData={pricingData}
              payment={payment}
            />
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

        {pricingData && (
          <Pricing
            isCardEnabled={false}
            keyPrice={
              pricingData.total <= 0
                ? 'FREE'
                : `${formatNumber(pricingData.total).toLocaleString()} ${
                    route.symbol
                  }`
            }
          />
        )}
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected
          injectedProvider={injectedProvider}
          service={checkoutService}
        >
          <div className="grid">
            <Button
              loading={isConfirming}
              disabled={isConfirming || isLoading || isPricingDataError}
              onClick={async (event) => {
                event.preventDefault()
                if (metadata) {
                  await updateUsersMetadata(metadata)
                }
                onConfirm()
              }}
            >
              {buttonLabel}
            </Button>
          </div>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
