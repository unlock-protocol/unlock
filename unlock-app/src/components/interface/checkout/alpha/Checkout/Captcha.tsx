import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { Button } from '@unlock-protocol/ui'
import { useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import ReCAPTCHA from 'react-google-recaptcha'
import { useConfig } from '~/utils/withConfig'
import { useStorageService } from '~/utils/withStorageService'
import { useActor } from '@xstate/react'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function Captcha({ injectedProvider, checkoutService }: Props) {
  const [state, send] = useActor(checkoutService)
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
          injectedProvider={injectedProvider}
          service={checkoutService}
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
