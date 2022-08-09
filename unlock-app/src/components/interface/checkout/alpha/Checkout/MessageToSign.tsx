import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { Button } from '@unlock-protocol/ui'
import { Fragment, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { IconButton, ProgressCircleIcon, ProgressFinishIcon } from '../Progress'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function MessageToSign({ checkoutService, injectedProvider }: Props) {
  const [state, send] = useActor(checkoutService)
  const { account, signMessage } = useAuth()
  const [isSigning, setIsSigning] = useState(false)
  const { paywallConfig } = state.context
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

  return (
    <Fragment>
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
            <IconButton
              title="Select payment method"
              icon={ProgressCircleIcon}
              onClick={() => {
                send('PAYMENT')
              }}
            />
            <ProgressCircleIcon />
          </div>
          <h4 className="text-sm"> Sign message </h4>
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
    </Fragment>
  )
}
