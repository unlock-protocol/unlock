import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { Button } from '@unlock-protocol/ui'
import { useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import ReCAPTCHA from 'react-google-recaptcha'
import { useConfig } from '~/utils/withConfig'
import { useStorageService } from '~/utils/withStorageService'
import { useActor } from '@xstate/react'
import {
  BackButton,
  CheckoutHead,
  CheckoutTransition,
  CloseButton,
} from '../Shell'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { useCheckoutHeadContent } from '../useCheckoutHeadContent'
import { ProgressCircleIcon, ProgressFinishIcon } from '../Progress'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onClose(params?: Record<string, string>): void
}

export function Captcha({ injectedProvider, checkoutService, onClose }: Props) {
  const [state, send] = useActor(checkoutService)
  const config = useConfig()
  const storage = useStorageService()
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null)
  const { recipients } = state.context
  const [isContinuing, setIsContinuing] = useState(false)
  const { paywallConfig } = state.context
  const { title, description, iconURL } =
    useCheckoutHeadContent(checkoutService)
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
              {paywallConfig.messageToSign ? (
                <button
                  aria-label="back"
                  onClick={(event) => {
                    event.preventDefault()
                    send('BACK')
                  }}
                  className="p-2 w-32 bg-brand-ui-primary inline-flex items-center justify-center rounded-full"
                >
                  <div className="p-0.5 w-28 bg-white rounded-full"></div>
                </button>
              ) : (
                <button
                  aria-label="back"
                  onClick={(event) => {
                    event.preventDefault()
                    send('BACK')
                  }}
                  className="p-2 w-28 bg-brand-ui-primary inline-flex items-center justify-center rounded-full"
                >
                  <div className="p-0.5 w-24 bg-white rounded-full"></div>
                </button>
              )}
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
          <div className="space-y-4">
            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey={config.recaptchaKey}
                onChange={(token) => setRecaptchaValue(token)}
              />
            </div>
          </div>
        </main>
        <footer className="px-6 pt-6 border-t grid items-center">
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
          <PoweredByUnlock />
        </footer>
      </div>
    </CheckoutTransition>
  )
}
