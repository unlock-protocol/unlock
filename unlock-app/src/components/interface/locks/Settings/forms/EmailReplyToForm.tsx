import { useMutation } from '@tanstack/react-query'
import { Button, Input, ToggleSwitch } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { storage } from '~/config/storage'

interface EmailReplyToFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
  lockSettings?: Record<string, any>
}

interface FormProps {
  replyTo?: string
}

export const EmailReplyToForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
  lockSettings,
}: EmailReplyToFormProps) => {
  const [enabled, setEnabled] = useState(false)
  const { handleSubmit, register, setValue } = useForm<FormProps>({
    defaultValues: {
      replyTo: lockSettings?.replyTo,
    },
  })

  const updateReplyTo = async ({ replyTo }: FormProps) => {
    if (!isManager) return
    return await storage.saveLockSetting(network, lockAddress, {
      replyTo,
    })
  }

  const updateReplyToMutation = useMutation(updateReplyTo)

  const disabledInput = !isManager || disabled

  const onSubmit = async (fields: FormProps) => {
    await updateReplyToMutation.mutateAsync(fields)
  }

  useEffect(() => {
    const replyTo = lockSettings?.replyTo
    setValue('replyTo', replyTo, {
      shouldDirty: true,
    })
    setEnabled(replyTo?.length > 0)
  }, [lockSettings, setValue])

  return (
    <div className="relative">
      {isManager && (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <ToggleSwitch
            title="Enable Reply-to"
            disabled={disabledInput}
            enabled={enabled}
            setEnabled={(enabled) => {
              setEnabled(enabled)
              setValue('replyTo', enabled ? lockSettings?.replyTo : '', {
                shouldDirty: true,
              })
            }}
          />
          <div className="flex flex-col gap-1">
            <Input
              type="email"
              placeholder="your@email.com"
              label="Reply-to"
              disabled={disabledInput || !enabled}
              {...register('replyTo')}
            />
            <span className="text-xs text-gray-600">
              Set the email address that will appear on the Reply-To: field.
            </span>
          </div>
          <Button
            className="w-full md:w-1/3"
            type="submit"
            disabled={disabledInput}
            loading={updateReplyToMutation.isLoading}
            size="small"
          >
            Apply
          </Button>
        </form>
      )}
    </div>
  )
}
