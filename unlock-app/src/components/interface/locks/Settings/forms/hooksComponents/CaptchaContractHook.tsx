import { DEFAULT_USER_ACCOUNT_ADDRESS } from '~/constants'
import { ConnectForm } from '../../../CheckoutUrl/elements/DynamicForm'
import { CustomComponentProps } from '../UpdateHooksForm'
import { Button } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import networks from '@unlock-protocol/networks'
import { Hook, HookType } from '@unlock-protocol/types'

export const CaptchaContractHook = ({
  name,
  disabled,
  defaultValue,
  network,
}: CustomComponentProps) => {
  const [isSet, setIsSet] = useState(false)
  const hookAddress =
    networks?.[network]?.hooks?.onKeyPurchaseHook?.find(
      (hook: Hook) => hook.id === HookType.CAPTCHA
    )?.address ?? ''

  useEffect(() => {
    setIsSet(false)
  }, [defaultValue])

  return (
    <ConnectForm>
      {({ setValue }: any) => {
        const isActive = defaultValue === hookAddress

        return (
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-brand-ui-primary">
              {isActive
                ? 'Captcha is active, and will be required as step of checkout.'
                : 'Captcha is not currently active.'}
            </span>
            <div>
              <Button
                size="small"
                type="button"
                disabled={isSet || disabled}
                onClick={() => {
                  if (isActive) {
                    setValue(name, DEFAULT_USER_ACCOUNT_ADDRESS)
                  } else {
                    setValue(name, hookAddress)
                  }
                  setIsSet(true)
                }}
              >
                {isActive ? 'Remove Captcha hook' : 'Set Captcha hook'}
              </Button>
            </div>
            {isSet && (
              <span className="text-sm text-gray-600">
                {`Remember to press "Apply" at the end of the form to apply
                changes.`}
              </span>
            )}
          </div>
        )
      }}
    </ConnectForm>
  )
}
