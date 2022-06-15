import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutState, CheckoutStateDispatch } from '../useCheckoutState'
import { PaywallConfig } from '~/unlockTypes'
import { LoggedIn, LoggedOut } from '../Bottom'
import { Shell } from '../Shell'
import { Button } from '@unlock-protocol/ui'
import { useState } from 'react'
import { useAuthenticateHandler } from '~/hooks/useAuthenticateHandler'

interface Props {
  injectedProvider: unknown
  paywallConfig: PaywallConfig
  dispatch: CheckoutStateDispatch
  state: CheckoutState
}

export function MessageToSign({
  dispatch,
  injectedProvider,
  paywallConfig,
}: Props) {
  const { account, deAuthenticate, signMessage } = useAuth()
  const { authenticateWithProvider } = useAuthenticateHandler({
    injectedProvider,
  })
  const [isSigning, setIsSigning] = useState(false)
  const [signingError, setSigningError] = useState('')

  const onSign = async () => {
    setIsSigning(true)
    try {
      const signature = await signMessage(paywallConfig.messageToSign!)
      dispatch({
        type: 'ADD_SIGNATURE',
        payload: {
          signature,
        },
      })
      if (paywallConfig.captcha) {
        dispatch({
          type: 'CONTINUE',
          payload: {
            continue: 'CAPTCHA',
          },
        })
      } else {
        dispatch({
          type: 'CONTINUE',
          payload: {
            continue: 'CONFIRM',
          },
        })
      }
    } catch (error) {
      if (error instanceof Error) {
        setSigningError(error.message)
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
