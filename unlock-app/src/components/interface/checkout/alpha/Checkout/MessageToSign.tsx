import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutState, CheckoutSend } from '../checkoutMachine'
import { PaywallConfig } from '~/unlockTypes'
import { LoggedIn, LoggedOut } from '../Bottom'
import { Shell } from '../Shell'
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
      send({
        type: 'SIGN_MESSAGE',
        signature,
        address: account!,
      })
    } catch (error) {
      if (error instanceof Error) {
        ToastHelper.error(error.message)
      }
    }
    setIsSigning(false)
  }

  return (
    <>
      <Shell.Content>
        <pre className="text-brand-gray whitespace-pre-wrap">
          {paywallConfig.messageToSign}
        </pre>
      </Shell.Content>
      <Shell.Footer>
        <div className="space-y-4">
          {account ? (
            <div className="space-y-2">
              <Button
                disabled={!account || isSigning}
                loading={isSigning}
                onClick={onSign}
                className="w-full"
              >
                Sign the message
              </Button>
              <LoggedIn
                account={account}
                onDisconnect={() => deAuthenticate()}
              />
            </div>
          ) : (
            <LoggedOut
              authenticateWithProvider={authenticateWithProvider}
              onUnlockAccount={() => {}}
            />
          )}
        </div>
      </Shell.Footer>
    </>
  )
}
