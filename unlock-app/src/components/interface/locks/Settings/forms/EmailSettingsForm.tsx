import { useMutation } from '@tanstack/react-query'
import { Button, Input } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useSaveLockSettings } from '~/hooks/useLockSettings'

interface EmailReplyToFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
  lockSettings?: FormProps
}

interface FormProps {
  replyTo?: string
  emailSender?: string
}

export const EmailSettingsForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
  lockSettings,
}: EmailReplyToFormProps) => {
  const { handleSubmit, register } = useForm<FormProps>({
    defaultValues: {
      replyTo: lockSettings?.replyTo,
      emailSender: lockSettings?.emailSender,
    },
  })

  const { mutateAsync: saveSettingsMutation } = useSaveLockSettings()

  const updateReplyTo = async (config: FormProps) => {
    if (!isManager) return
    return await saveSettingsMutation({
      lockAddress,
      network,
      ...config,
    })
  }

  const updateReplyToMutation = useMutation(updateReplyTo)

  const disabledInput = !isManager || disabled

  const onSubmit = async (fields: FormProps) => {
    await updateReplyToMutation.mutateAsync(fields)
    ToastHelper.success('Email settings updated.')
  }

  return (
    <div className="relative">
      {isManager && (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1">
            <Input
              type="email"
              placeholder="your@email.com"
              label="Reply-to:"
              disabled={disabledInput}
              {...register('replyTo')}
            />
            <span className="text-sm text-gray-600">
              Set the email address that will appear on the Reply-To field when
              users respond to the email we send.
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <Input
              type="text"
              placeholder="Your name"
              label="Email sender name:"
              disabled={disabledInput}
              autoComplete="off"
              description="Set the email sender name that will appear on the email sent. Emails will be sent from the address hello@unlock-protocol.com."
              {...register('emailSender')}
            />
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
