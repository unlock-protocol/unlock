import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutState, CheckoutSend } from './checkoutMachine'
import { PaywallConfig } from '~/unlockTypes'
import { Connected } from '../Connected'
import { Button } from '@unlock-protocol/ui'
import { useState } from 'react'
import { useAuthenticateHandler } from '~/hooks/useAuthenticateHandler'
import { ToastHelper } from '~/components/helpers/toast.helper'
import ReCAPTCHA from 'react-google-recaptcha'
import { useConfig } from '~/utils/withConfig'
import { useStorageService } from '~/utils/withStorageService'

interface Props {
  injectedProvider: unknown
  paywallConfig: PaywallConfig
  send: CheckoutSend
  state: CheckoutState
}

export function Captcha({ injectedProvider, send, state }: Props) {
  const { account, deAuthenticate } = useAuth()
  const { authenticateWithProvider } = useAuthenticateHandler({
    injectedProvider,
  })
  const config = useConfig()
  const storage = useStorageService()
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null)
  const { recipients } = state.context
  const [isContinuing, setIsContinuing] = useState(false)
  const onContinue = async () => {
    try {
      setIsContinuing(true)
      if (!(recaptchaValue && recipients.length)) {
        return
      }
      const response = await storage.getDataForRecipientsAndCaptcha(
        recipients,
        recaptchaValue!
      )

      if (response.error) {
        throw new Error(response.error)
      }
      const data: string[] = response.signatures
      setIsContinuing(false)
      send({
        type: 'SOLVE_CAPTCHA',
        data,
      })
    } catch (error) {
      if (error instanceof Error) {
        ToastHelper.error(error.message)
      }
      setIsContinuing(false)
    }
  }
  return (
    <div>
      <main className="p-6 overflow-auto h-64 sm:h-72">
        <div className="space-y-4">
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={config.recaptchaKey}
              onChange={(token) => setRecaptchaValue(token)}
            />
          </div>
        </div>
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
            className="w-full"
            disabled={!recaptchaValue || isContinuing}
            loading={isContinuing}
            onClick={(event) => {
              event.preventDefault()
              onContinue()
            }}
          >
            {!recaptchaValue
              ? 'Solve captcha to continue'
              : isContinuing
              ? 'Continuing'
              : 'Continue'}
          </Button>
        </Connected>
      </footer>
    </div>
  )
}
