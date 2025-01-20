import { CheckoutService } from './checkoutMachine'
import { Button } from '@unlock-protocol/ui'
import { Fragment, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import ReCAPTCHA from 'react-google-recaptcha'
import { useConfig } from '~/utils/withConfig'
import { useSelector } from '@xstate/react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import Disconnect from './Disconnect'
import { locksmith } from '~/config/locksmith'
import { useAuthenticate } from '~/hooks/useAuthenticate'

interface Props {
  checkoutService: CheckoutService
}

export function Captcha({ checkoutService }: Props) {
  const { recipients, lock } = useSelector(
    checkoutService,
    (state) => state.context
  )
  const config = useConfig()
  const { account } = useAuthenticate()
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null)
  const [isContinuing, setIsContinuing] = useState(false)
  const users = recipients.length > 0 ? recipients : [account!]

  const onContinue = async () => {
    try {
      setIsContinuing(true)
      if (!recaptchaValue) {
        return
      }
      const response = await locksmith.getDataForRecipientsAndCaptcha(
        users,
        recaptchaValue!,
        lock!.address,
        lock!.network
      )

      if (response.status !== 200) {
        throw new Error(response.data.toString())
      }
      const data: string[] = response.data.signatures as string[]
      setIsContinuing(false)
      checkoutService.send({
        type: 'SUBMIT_DATA',
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
      <Stepper service={checkoutService} />
      <main className="h-full px-6 py-2 overflow-auto">
        <div className="flex justify-center">
          {/* @ts-expect-error ReCaptcha is not a valid JSX component */}
          <ReCAPTCHA
            sitekey={config.recaptchaKey}
            onChange={(token) => setRecaptchaValue(token)}
          />
        </div>
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
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
        <Disconnect service={checkoutService} />
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
