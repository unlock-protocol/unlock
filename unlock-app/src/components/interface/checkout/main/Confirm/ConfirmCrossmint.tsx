import { CrossmintPaymentElement } from '@crossmint/client-sdk-react-ui'

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
import { useGetLockSettings } from '~/hooks/useLockSettings'
import { getCurrencySymbol } from '~/utils/currency'
import { useAuth } from '~/contexts/AuthenticationContext'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onConfirmed: (lock: string, hash?: string) => void
  onError: (message: string) => void
}

export function ConfirmCrossmint({
  injectedProvider,
  checkoutService,
  onConfirmed,
  onError,
}: Props) {
  const { account } = useAuth()
  const [state] = useActor(checkoutService)
  const config = useConfig()
  const [isConfirming, setIsConfirming] = useState(false)
  const { lock, recipients, payment, paywallConfig, metadata, data, renew } =
    state.context

  const { address: lockAddress, network: lockNetwork } = lock!
  const onCrossmintEvent = (event: any) => {
    // We get the events from crossmint
    // https://docs.crossmint.com/docs/2c-embed-checkout-inside-your-ui#4-displaying-progress-success-and-errors-in-your-ui
    console.log(event)
  }
  return (
    <Fragment>
      <main className="h-full p-6 space-y-2 overflow-auto">
        <div className="grid gap-y-2">
          <div>
            <h4 className="text-xl font-bold"> {lock!.name}</h4>
            <ViewContract lockAddress={lock!.address} network={lockNetwork} />
          </div>
        </div>
        <CrossmintPaymentElement
          recipient={{
            wallet: account,
          }}
          clientId="1d837cfc-6299-47b4-b5f9-462d5df00f33"
          environment="staging"
          mintConfig={{
            totalPrice: '0.005',
            _values: ['5000000000000000'],
            _referrers: ['0x6C3b3225759Cbda68F96378A9F0277B4374f9F06'],
            _keyManagers: ['0x6C3b3225759Cbda68F96378A9F0277B4374f9F06'],
            _data: ['0x'],
          }}
          currency="USD" // USD only, more coming soon
          locale="en-US" // en-US only, more coming soon
          // uiConfig={{
          //   colors: {
          //     background: '#000814',
          //     backgroundSecondary: '#001D3D',
          //     backgroundTertiary: '#EEEEEE',
          //     textPrimary: '#FFFFFF',
          //     textSecondary: '#EEEEEE',
          //     accent: '#FFC300',
          //     danger: '#FFC300',
          //     textLink: '#FFC300',
          //   },
          //   fontSizeBase: '0.91rem',
          //   spacingUnit: '0.274rem',
          //   borderRadius: '4px',
          //   fontWeightPrimary: '400',
          //   fontWeightSecondary: '500',
          // }}
          onEvent={onCrossmintEvent}
        />
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
