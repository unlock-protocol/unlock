import { CheckoutService } from './checkoutMachine'
import { Button, Checkbox } from '@unlock-protocol/ui'
import { Fragment, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useSelector } from '@xstate/react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import Disconnect from './Disconnect'
import { locksmith } from '~/config/locksmith'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useReCaptcha } from 'next-recaptcha-v3'
import Link from 'next/link'
import { FaCheckCircle as CheckIcon } from 'react-icons/fa'

interface Props {
  checkoutService: CheckoutService
}

export function Captcha({ checkoutService }: Props) {
  const { recipients, lock } = useSelector(
    checkoutService,
    (state) => state.context
  )
  const { account } = useAuthenticate()
  const { executeRecaptcha } = useReCaptcha()
  const [isChecked, setIsChecked] = useState(false)
  const [isContinuing, setIsContinuing] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const users = recipients.length > 0 ? recipients : [account!]

  const handleCheckboxChange = async (checked: boolean) => {
    if (recaptchaToken) {
      return // Prevent unchecking after successful verification
    }

    setIsChecked(checked)
    setError(null)

    if (checked) {
      try {
        const token = await executeRecaptcha('captcha_checkout')
        setRecaptchaToken(token)
      } catch (error) {
        setIsChecked(false)
        setError('Failed to verify human status. Please try again.')
        if (error instanceof Error) {
          ToastHelper.error('Failed to verify human status. Please try again.')
        }
      }
    }
  }

  const onContinue = async () => {
    try {
      setIsContinuing(true)
      if (!recaptchaToken) {
        return
      }

      const response = await locksmith.getDataForRecipientsAndCaptcha(
        users,
        recaptchaToken,
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
        <div className="flex flex-col items-center space-y-2 mt-5">
          {recaptchaToken ? (
            <div className="flex flex-col items-center gap-2">
              <CheckIcon className="w-12 h-12 text-green-500" />
              <span className="text-sm text-green-500">
                Captcha verification passed
              </span>
            </div>
          ) : (
            <div className="flex bg-gray-100 text-brand-ui-primary flex-col items-start pt-2 pb-1 px-2 rounded-md">
              <Checkbox
                fieldSize={'large'}
                label="Solve captcha"
                checked={isChecked}
                disabled={!!recaptchaToken}
                onChange={(e) => handleCheckboxChange(e.target.checked)}
              />
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!recaptchaToken && (
            // Must-have text to display when hiding the captcha badge
            <p className="text-center text-[10px]">
              This site is protected by reCAPTCHA and the Google{' '}
              <Link
                target="_blank"
                href="https://policies.google.com/privacy"
                className="text-blue-500"
              >
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link
                target="_blank"
                href="https://policies.google.com/terms"
                className="text-blue-500"
              >
                Terms of Service
              </Link>{' '}
              apply.
            </p>
          )}
        </div>
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Button
          className="w-full"
          disabled={!recaptchaToken || isContinuing}
          loading={isContinuing}
          onClick={(event) => {
            event.preventDefault()
            onContinue()
          }}
        >
          {!isChecked
            ? 'Solve captcha to continue'
            : !recaptchaToken
              ? 'Verifying...'
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
