import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { Button } from '@unlock-protocol/ui'
import { Fragment, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import ReCAPTCHA from 'react-google-recaptcha'
import { useConfig } from '~/utils/withConfig'
import { useStorageService } from '~/utils/withStorageService'
import { useActor } from '@xstate/react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Progress'

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
  const { paywallConfig, skipQuantity } = state.context
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
    <Fragment>
      <Stepper
        position={6}
        service={checkoutService}
        items={[
          {
            id: 1,
            name: 'Select lock',
            to: 'SELECT',
          },
          {
            id: 2,
            name: 'Choose quantity',
            skip: skipQuantity,
            to: 'QUANTITY',
          },
          {
            id: 3,
            name: 'Add recipients',
            to: 'METADATA',
          },
          {
            id: 4,
            name: 'Choose payment',
            to: 'PAYMENT',
          },
          {
            id: 5,
            name: 'Sign message',
            skip: !paywallConfig.messageToSign,
            to: 'MESSAGE_TO_SIGN',
          },
          {
            id: 6,
            name: 'Solve captcha',
            to: 'CAPTCHA',
            skip: !paywallConfig.captcha,
          },
          {
            id: 7,
            name: 'Confirm',
            to: 'CONFIRM',
          },
          {
            id: 8,
            name: 'Minting NFT',
          },
        ]}
      />
      <main className="h-full px-6 py-2 overflow-auto">
        <div className="space-y-4">
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={config.recaptchaKey}
              onChange={(token) => setRecaptchaValue(token)}
            />
          </div>
        </div>
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
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
    </Fragment>
  )
}
