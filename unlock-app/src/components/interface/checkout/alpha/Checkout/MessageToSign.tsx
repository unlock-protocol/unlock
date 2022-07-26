import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { Button } from '@unlock-protocol/ui'
import { useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import {
  BackButton,
  CheckoutHead,
  CheckoutTransition,
  CloseButton,
} from '../Shell'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { useCheckoutHeadContent } from '../useCheckoutHeadContent'
import { IconButton, ProgressCircleIcon, ProgressFinishIcon } from '../Progress'

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
  const { paywallConfig } = state.context
  const { messageToSign } = paywallConfig
  const { title, description, iconURL } =
    useCheckoutHeadContent(checkoutService)

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
    <CheckoutTransition>
      <div className="bg-white max-w-md rounded-xl flex flex-col w-full h-[90vh] sm:h-[80vh] max-h-[42rem]">
        <div className="flex items-center justify-between p-6">
          <BackButton onClick={() => send('BACK')} />
          <CloseButton onClick={() => onClose()} />
        </div>
        <CheckoutHead
          title={paywallConfig.title}
          iconURL={iconURL}
          description={description}
        />
        <div className="flex px-6 p-2 flex-wrap items-center w-full gap-2">
          <div className="flex items-center gap-2 col-span-4">
            <div className="flex items-center gap-0.5">
              <IconButton
                title="Select lock"
                icon={ProgressCircleIcon}
                onClick={() => {
                  send('SELECT')
                }}
              />
              <IconButton
                title="Choose quantity"
                icon={ProgressCircleIcon}
                onClick={() => {
                  send('QUANTITY')
                }}
              />
              <IconButton
                title="Add metadata"
                icon={ProgressCircleIcon}
                onClick={() => {
                  send('METADATA')
                }}
              />
              <ProgressCircleIcon />
            </div>
            <h4 className="text-sm "> {title}</h4>
          </div>
          <div className="border-t-4 w-full flex-1"></div>
          <div className="inline-flex items-center gap-1">
            <ProgressCircleIcon disabled />
            <ProgressFinishIcon disabled />
          </div>
        </div>
        <main className="px-6 py-2 overflow-auto h-full">
          <pre className="text-brand-gray whitespace-pre-wrap">
            {messageToSign}
          </pre>
        </main>
        <footer className="px-6 pt-6 border-t grid items-center">
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
      </div>
    </CheckoutTransition>
  )
}
