import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutState, CheckoutSend } from './checkoutMachine'
import { PaywallConfig } from '~/unlockTypes'
import { Connected } from '../Connected'
import { Button } from '@unlock-protocol/ui'
import { useState } from 'react'
import { useAuthenticateHandler } from '~/hooks/useAuthenticateHandler'
import { ToastHelper } from '~/components/helpers/toast.helper'

interface Props {
  injectedProvider: unknown
  paywallConfig: PaywallConfig
  send: CheckoutSend
  state: CheckoutState
}

export function MessageToSign({
  send,
  injectedProvider,
  paywallConfig,
}: Props) {
  const { account, deAuthenticate, signMessage } = useAuth()
  const { authenticateWithProvider } = useAuthenticateHandler({
    injectedProvider,
  })
  const [isSigning, setIsSigning] = useState(false)

  const onSign = async () => {
    setIsSigning(true)
    try {
      const signature = await signMessage(paywallConfig.messageToSign!)
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
    <div>
      <main className="p-6 overflow-auto h-64 sm:h-72">
        <pre className="text-brand-gray whitespace-pre-wrap">
          {paywallConfig.messageToSign}
        </pre>
      </main>
      <footer className="p-6 border-t grid items-center">
        <Connected
          account={account}
          onDisconnect={() => {
            deAuthenticate()
            send('DISCONNECT')
          }}
          authenticateWithProvider={authenticateWithProvider}
          onUnlockAccount={() => {
            send('UNLOCK_ACCOUNT')
          }}
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
    </div>
  )
}
