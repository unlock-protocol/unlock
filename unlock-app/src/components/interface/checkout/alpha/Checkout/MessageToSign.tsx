import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { Button } from '@unlock-protocol/ui'
import { Fragment, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { StepItem, Stepper } from '../Stepper'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function MessageToSign({ checkoutService, injectedProvider }: Props) {
  const [state, send] = useActor(checkoutService)
  const { account, signMessage } = useAuth()
  const [isSigning, setIsSigning] = useState(false)
  const { paywallConfig, skipQuantity, payment } = state.context
  const { messageToSign } = paywallConfig

  const onSign = async () => {
    setIsSigning(true)
    try {
      const signature = await signMessage(messageToSign!)
      setIsSigning(false)
      send({
        type: 'SIGN_MESSAGE',
        signature,
        address: account!,
      })
    } catch (error) {
      if (error instanceof Error) {
        ToastHelper.error(error.message)
      }
      setIsSigning(false)
    }
  }

  const stepItems: StepItem[] = [
    {
      id: 1,
      name: 'Select lock',
      to: 'SELECT',
    },
    {
      id: 2,
      name: 'Choose quantity',
      skip: skipQuantity,
      to: 'QUANTITY',
    },
    {
      id: 3,
      name: 'Add recipients',
      to: 'METADATA',
    },
    {
      id: 4,
      name: 'Choose payment',
      to: 'PAYMENT',
    },
    {
      id: 5,
      name: 'Sign message',
      skip: !paywallConfig.messageToSign,
      to: 'MESSAGE_TO_SIGN',
    },
    {
      id: 6,
      name: 'Solve captcha',
      to: 'CAPTCHA',
      skip:
        !paywallConfig.captcha || ['card', 'claim'].includes(payment.method),
    },
    {
      id: 7,
      name: 'Confirm',
      to: 'CONFIRM',
    },
    {
      id: 8,
      name: 'Minting NFT',
    },
  ]

  return (
    <Fragment>
      <Stepper position={5} service={checkoutService} items={stepItems} />
      <main className="h-full px-6 py-2 overflow-auto">
        <pre className="whitespace-pre-wrap text-brand-gray">
          {messageToSign}
        </pre>
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected
          injectedProvider={injectedProvider}
          service={checkoutService}
        >
          <Button
            disabled={!account || isSigning}
            loading={isSigning}
            onClick={onSign}
            className="w-full"
          >
            Sign the message
          </Button>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
