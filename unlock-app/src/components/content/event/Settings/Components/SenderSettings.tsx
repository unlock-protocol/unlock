import { locksmith } from '~/config/locksmith'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { Button, Input } from '@unlock-protocol/ui'
import { formDataToMetadata } from '@unlock-protocol/core'

import { useForm } from 'react-hook-form'
import { EmailsProps } from '../Emails'

export const SenderSettings = ({ checkoutConfig, event }: EmailsProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      replyTo: event.replyTo,
      emailSender: event.emailSender,
    },
  })
  const save = async (values: { replyTo: string; emailSender: string }) => {
    await ToastHelper.promise(
      locksmith.saveEventData({
        data: {
          ...formDataToMetadata({
            ...event,
          }),
          ...values,
        },
        // @ts-expect-error
        checkoutConfig,
      }),
      {
        success: 'Settings saved!',
        error:
          'We could not save. Please try again and report if the issue persists.',
        loading: "Updating your event's properties.",
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(save)}>
      <div
        className="grid md:grid-cols-2 gap-2 justify-items-stretch"
        onSubmit={handleSubmit(save)}
      >
        <Input
          {...register('emailSender', {
            required: {
              value: true,
              message: 'A name is required',
            },
          })}
          type="text"
          placeholder="Satoshi Nakamoto"
          label="Name:"
          description="Used on confirmation emails sent to attendees."
          error={errors.emailSender?.message as string}
        />
        <Input
          label="Email address:"
          {...register('replyTo', {
            required: {
              value: true,
              message: 'A name is required',
            },
          })}
          type="email"
          autoComplete="off"
          placeholder="your@email.com"
          error={errors.replyTo?.message as string}
          description={'Used when users respond to automated emails.'}
        />
      </div>
      <div className="flex flex-end w-full pt-8 flex-row-reverse">
        <Button loading={isSubmitting} type="submit" className="w-48">
          Save
        </Button>
      </div>
    </form>
  )
}
