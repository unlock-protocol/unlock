import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { Button } from '@unlock-protocol/ui'
import React, { Fragment, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import ReCAPTCHA from 'react-google-recaptcha'
import { useConfig } from '~/utils/withConfig'
import { useStorageService } from '~/utils/withStorageService'
import { useActor } from '@xstate/react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { useAuth } from '~/contexts/AuthenticationContext'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function Captcha({ injectedProvider, checkoutService }: Props) {
  const [state, send] = useActor(checkoutService)
  const config = useConfig()
  const { account } = useAuth()
  const storage = useStorageService()
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null)
  const { recipients, lock } = state.context
  const [isContinuing, setIsContinuing] = useState(false)
  const users = recipients.length > 0 ? recipients : [account!]

  const onContinue = async () => {
    try {
      setIsContinuing(true)
      if (!recaptchaValue) {
        return
      }
      const response = await storage.getDataForRecipientsAndCaptcha(
        users,
        recaptchaValue!,
        lock!.address,
        lock!.network
      )

      if (response.error) {
        throw new Error(response.error)
      }
      const data: string[] = response.signatures
      setIsContinuing(false)
      send({
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
          {/* 
            todo: Type '{}' is not assignable to type 'ReactNode'.
              
            @ts-ignore */}
          <ReCAPTCHA
            sitekey={config.recaptchaKey}
            onChange={(token) => setRecaptchaValue(token)}
          />
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
