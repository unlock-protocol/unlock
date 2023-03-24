import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { Button } from '@unlock-protocol/ui'
import { Fragment, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { useCheckoutSteps } from './useCheckoutItems'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function MessageToSign({ checkoutService, injectedProvider }: Props) {
  const [state, send] = useActor(checkoutService)
  const { account, getWalletService } = useAuth()
  const [isSigning, setIsSigning] = useState(false)
  const { paywallConfig } = state.context
  const { messageToSign } = paywallConfig

  const onSign = async () => {
    setIsSigning(true)
    try {
      const walletService = await getWalletService()

      const signature = await walletService.signMessage(
        messageToSign,
        'personal_sign'
      )
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

  const stepItems = useCheckoutSteps(checkoutService)

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
