import ReCaptcha from 'react-google-recaptcha'
import { CheckoutService } from './../checkoutMachine'
import { Connected } from '../../Connected'
import { Button } from '@unlock-protocol/ui'
import { Fragment, useRef, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import { CheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { PoweredByUnlock } from '../../PoweredByUnlock'
import { Pricing } from '../../Lock'
import { lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { Lock } from '~/unlockTypes'
import { RiErrorWarningFill as ErrorIcon } from 'react-icons/ri'
import { ViewContract } from '../../ViewContract'
import { useClaim } from '~/hooks/useClaim'
import { useUpdateUsersMetadata } from '~/hooks/useUserMetadata'
import { usePricing } from '~/hooks/usePricing'
import { usePurchaseData } from '~/hooks/usePurchaseData'
import { formatNumber } from '~/utils/formatter'
import { useFiatChargePrice } from '~/hooks/useFiatChargePrice'
import { useConfig } from '~/utils/withConfig'
import { PricingData } from './PricingData'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  communication?: CheckoutCommunication
}

export function ConfirmClaim({
  injectedProvider,
  checkoutService,
  communication,
}: Props) {
  const [state, send] = useActor(checkoutService)
  const config = useConfig()

  const recaptchaRef = useRef<any>()
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

  const { mutateAsync: claim } = useClaim({
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
    currencyContractAddress,
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

  const onConfirmClaim = async () => {
    try {
      setIsConfirming(true)
      if (payment.method !== 'claim') {
        return
      }

      const captcha = await recaptchaRef.current?.executeAsync()

      const { hash } = await claim({
        data: purchaseData?.[0],
        captcha,
      })

      if (hash) {
        communication?.emitTransactionInfo({
          hash,
          lock: lockAddress,
        })
        send({
          type: 'CONFIRM_MINT',
          status: 'FINISHED',
          transactionHash: hash,
        })
      } else {
        onError('No transaction hash returned. Failed to claim membership.')
      }
      setIsConfirming(false)
    } catch (error: any) {
      setIsConfirming(false)
      onError(error, 'Failed to claim membership. Try again.')
    }
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
                isCardEnabled={false}
              />
            )}
          </div>
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
                onConfirmClaim()
              }}
            >
              {isConfirming
                ? 'Claiming your membership'
                : 'Claim your membership'}
            </Button>
          </div>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
