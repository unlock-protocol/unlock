import { Button, Modal, TextBox } from '@unlock-protocol/ui'
import { Event, PaywallConfigType } from '@unlock-protocol/core'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { validateEmail } from '~/components/interface/checkout/main/utils'
import { useSendInvites } from '~/hooks/useSendInvites'

interface EmailsProps {
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

interface SendInvitesData {
  recipients: string
}

interface ConfirmModalProps {
  slug: string
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  onSuccess: () => void
  formData: SendInvitesData
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

export const ConfirmModal = ({
  slug,
  isOpen,
  setIsOpen,
  onSuccess,
  formData,
}: ConfirmModalProps) => {
  const { mutateAsync: sendEventInvites, isPending } = useSendInvites()

  const { handleSubmit } = useForm()

  const onSubmit = async () => {
    const { recipients } = formData

    await ToastHelper.promise(
      sendEventInvites({
        slug,
        recipients: recipients.split('\n').map((r) => r.trim()),
      }),
      {
        success: 'Invite sent!',
        error: 'There was an error while sending the emails.',
        loading: 'Sending the emails... please stand-by!',
      }
    )
    onSuccess()
    setIsOpen(false)
    return false
  }

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <header className="leading-relaxed">
            <h1 className="text-xl font-bold">Confirm Invites</h1>
            <p className="text-gray-600">
              Are you sure you want to send these invites?
            </p>
          </header>
          <div className="flex justify-end gap-6">
            <Button
              type="button"
              disabled={isPending}
              variant="outlined-primary"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              Send
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export const SendInvites = ({ checkoutConfig, event }: EmailsProps) => {
  const [confirm, setIsConfirm] = useState(false)
  const [formData, setFormData] = useState<SendInvitesData | undefined>()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<SendInvitesData>({
    defaultValues: {
      recipients: '',
    },
  })

  const onSubmit = (data: SendInvitesData) => {
    setFormData(data)
    setIsConfirm(true)
    return false
  }

  return (
    <div>
      {formData && (
        <ConfirmModal
          slug={event.slug}
          onSuccess={() => reset()}
          checkoutConfig={checkoutConfig}
          formData={formData}
          isOpen={confirm}
          setIsOpen={setIsConfirm}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2">
        <TextBox
          rows={5}
          error={errors.recipients?.message}
          label="Recipients (one per line):"
          description={<>List of email addresses to send the invite to. </>}
          placeholder={`friend@email.com
another@email.com`}
          {...register('recipients', {
            required: 'This field is required',
            validate: (value: string) => {
              clearErrors('recipients')
              const emails = value.split('\n')
              if (emails.length > 10) {
                setError('recipients', {
                  message: "You can't send more than 10 emails at once.",
                })
                return false
              }
              const anyInvalid = emails.some(
                (email) => email && !validateEmail(email)
              )
              if (anyInvalid) {
                setError('recipients', {
                  message: 'One or more emails are invalid.',
                })
              }
              return !anyInvalid
            },
          })}
        />
        <div className="flex justify-end gap-6">
          <Button disabled={!isValid}>Send</Button>
        </div>
      </form>
    </div>
  )
}

export default SendInvites
