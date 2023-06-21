import ReCaptcha from 'react-google-recaptcha'
import { CheckoutService } from './../checkoutMachine'
import { Connected } from '../../Connected'
import { Button } from '@unlock-protocol/ui'
import { Fragment, useRef, useState } from 'react'
import { useActor } from '@xstate/react'
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
import { useConfig } from '~/utils/withConfig'
import { PricingData } from './PricingData'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onConfirmed: (lock: string, hash?: string) => void
  onError: (message: string) => void
}

export function ConfirmClaim({
  injectedProvider,
  checkoutService,
  onConfirmed,
  onError,
}: Props) {
  const [state] = useActor(checkoutService)
  const config = useConfig()

  const recaptchaRef = useRef<any>()
  const [isConfirming, setIsConfirming] = useState(false)
  const { lock, recipients, payment, paywallConfig, metadata, data } =
    state.context

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

  const isLoading = isPricingDataLoading || isInitialDataLoading

  const onConfirmClaim = async () => {
    setIsConfirming(true)
    const captcha = await recaptchaRef.current?.executeAsync()
    const { hash } = await claim({
      data: purchaseData?.[0],
      captcha,
    })

    if (hash) {
      onConfirmed(lockAddress, hash)
    } else {
      onError('No transaction hash returned. Failed to claim membership.')
    }
    setIsConfirming(false)
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
            OK
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
                keyPrice={'FREE'}
                usdPrice={'0.00'}
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
              {isConfirming ? 'Claiming' : 'Claim'}
            </Button>
          </div>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
