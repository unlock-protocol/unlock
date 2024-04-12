import { SettingCard } from '~/components/interface/locks/Settings/elements/SettingCard'
import { useForm } from 'react-hook-form'

import {
  Event,
  PaywallConfigType,
  formDataToMetadata,
} from '@unlock-protocol/core'
import { storage } from '~/config/storage'
import { Button, Input } from '@unlock-protocol/ui'
import { ToastHelper } from '~/components/helpers/toast.helper'

interface EmailsProps {
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

export const Emails = ({ event, checkoutConfig }: EmailsProps) => {
  console.log(event)
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
      storage.saveEventData({
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
        success: 'Event saved!',
        error:
          'We could not save your event. Please try again and report if the issue persists.',
        loading: `Updating your event's properties.`,
      }
    )
  }

  return (
    <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit(save)}>
      <SettingCard
        label="Emails"
        description="Configure and send emails to the attendees of your event."
      >
        <div className="grid md:grid-cols-2 gap-2 justify-items-stretch">
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
            description={`Used when users respond to automated emails.`}
          />
        </div>
        <div className="flex flex-end w-full pt-8 flex-row-reverse">
          <Button loading={isSubmitting} type="submit" className="w-48">
            Save
          </Button>
        </div>
      </SettingCard>
    </form>
  )
}
