import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { Button } from '@unlock-protocol/ui'
import { useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import { Shell } from '../Shell'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onClose(params?: Record<string, string>): void
}

export function MessageToSign({
  checkoutService,
  injectedProvider,
  onClose,
}: Props) {
  const [state, send] = useActor(checkoutService)
  const { account, signMessage } = useAuth()
  const [isSigning, setIsSigning] = useState(false)
  const { messageToSign } = state.context.paywallConfig
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

  return (
    <Shell.Root onClose={() => onClose()}>
      <Shell.Head checkoutService={checkoutService} />
      <main className="p-6 overflow-auto h-64 sm:h-72">
        <pre className="text-brand-gray whitespace-pre-wrap">
          {messageToSign}
        </pre>
      </main>
      <footer className="p-6 border-t grid items-center">
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
      </footer>
    </Shell.Root>
  )
}
