import { CustomComponentProps } from '../UpdateHooksForm'
import { Button } from '@unlock-protocol/ui'
import networks from '@unlock-protocol/networks'
import { Hook, HookType } from '@unlock-protocol/types'
import { useFormContext } from 'react-hook-form'
import { ADDRESS_ZERO } from '~/constants'

export const CaptchaContractHook = ({
  disabled,
  defaultValue,
  network,
  setEventsHooksMutation,
}: CustomComponentProps) => {
  const hookAddress =
    networks?.[network]?.hooks?.onKeyPurchaseHook?.find(
      (hook: Hook) => hook.id === HookType.CAPTCHA
    )?.address ?? ''

  const { handleSubmit } = useFormContext()

  const isActive = defaultValue === hookAddress

  const onSubmit = async (values: any) => {
    if (isActive) {
      // Disable!
      setEventsHooksMutation.mutateAsync({
        ...values,
        keyPurchase: ADDRESS_ZERO,
      })
    } else {
      setEventsHooksMutation.mutateAsync(values)
    }
  }

  const disabledInput = disabled || setEventsHooksMutation.isLoading

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <p className="text-sm">
        {isActive
          ? 'Captcha is active, and will be required as part of the Unlock checkout.'
          : 'Captcha is not currently active.'}
      </p>
      <div className="ml-auto">
        <Button
          loading={setEventsHooksMutation.isLoading}
          size="small"
          type="submit"
          disabled={disabledInput}
        >
          {isActive ? 'Disable' : 'Enable'}
        </Button>
      </div>
    </form>
  )
}
