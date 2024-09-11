import {
  Button,
  Input,
  Modal,
  Placeholder,
  TextBox,
  Checkbox,
} from '@unlock-protocol/ui'
import { Event, PaywallConfigType } from '@unlock-protocol/core'
import { useMultipleLockData } from '~/hooks/useLockData'
import { useState } from 'react'
import { useCustomEmailSend } from '~/hooks/useCustomEmail'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'

interface EmailsProps {
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

interface SendCustomEmailData {
  subject: string
  content: string
  [lockAddress: string]: boolean | string
}

interface ConfirmModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  onSuccess: () => void
  formData: SendCustomEmailData
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

export const ConfirmModal = ({
  isOpen,
  setIsOpen,
  onSuccess,
  formData,
  checkoutConfig,
}: ConfirmModalProps) => {
  const { mutateAsync: sendCustomEmail, isPending: isSendingCustomEmail } =
    useCustomEmailSend()

  const { handleSubmit } = useForm()

  const onSubmit = async () => {
    const { subject, content, ...locks } = formData

    await ToastHelper.promise(
      Promise.all(
        Object.keys(locks).map(async (address) => {
          if (locks[address]) {
            await sendCustomEmail({
              network:
                checkoutConfig.config.locks[address].network ||
                checkoutConfig.config.network!,
              lockAddress: address,
              content,
              subject,
            })
          }
        })
      ),
      {
        success: 'Emails sent!',
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
            <h1 className="text-xl font-bold">Confirm Email</h1>
            <p className="text-gray-600">
              Are you sure you want to send this email to all the confirmed
              attendees?
            </p>
          </header>
          <div className="flex justify-end gap-6">
            <Button
              type="button"
              disabled={isSendingCustomEmail}
              variant="outlined-primary"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isSendingCustomEmail}>
              Send
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export const SendCustomEmail = ({ checkoutConfig }: EmailsProps) => {
  const [confirm, setIsConfirm] = useState(false)
  const [formData, setFormData] = useState<SendCustomEmailData | undefined>()

  const {
    register,
    setError,
    clearErrors,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<SendCustomEmailData>({
    defaultValues: {
      subject: '',
      content: '',
      ...Object.keys(checkoutConfig.config.locks).reduce(
        (acc, address) => ({ ...acc, [address]: true }),
        {}
      ),
    },
  })

  const loadingLocks = useMultipleLockData(checkoutConfig.config.locks)

  const onSubmit = (data: SendCustomEmailData) => {
    setFormData(data)
    setIsConfirm(true)
    return false
  }

  return (
    <div>
      {formData && (
        <ConfirmModal
          onSuccess={() => reset()}
          checkoutConfig={checkoutConfig}
          formData={formData}
          isOpen={confirm}
          setIsOpen={setIsConfirm}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2">
        {loadingLocks.map(({ lock, isLockLoading }, index) => {
          if (isLockLoading || !lock) {
            return (
              <Placeholder.Root key={index}>
                <Placeholder.Line width="sm" />
              </Placeholder.Root>
            )
          } else {
            return (
              <div
                key={index}
                className={loadingLocks.length == 1 ? 'hidden' : ''}
              >
                <Checkbox
                  {...register(lock.address, {
                    validate: (_, { subject, content, ...locksToSend }) => {
                      if (!Object.values(locksToSend).some((value) => value)) {
                        setError('root', {
                          type: 'custom',
                          message: 'At least one lock must be selected',
                        })
                      } else {
                        clearErrors('root')
                      }
                      return true
                    },
                  })}
                  label={lock.name}
                />
              </div>
            )
          }
        })}
        {errors.root && (
          <p className="text-red-500 text-sm">{errors.root.message}</p>
        )}

        <Input
          label="Subject"
          placeholder="Update regarding the event"
          error={errors.subject?.message}
          {...register('subject', {
            required: 'This field is required',
          })}
        />
        <TextBox
          rows={5}
          error={errors.content?.message}
          label="Content"
          description={
            <>
              The content of the email.{' '}
              <a
                className="text-brand-ui-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.markdownguide.org/cheat-sheet"
              >
                Markdown is supported.
              </a>
            </>
          }
          placeholder="New information on the event..."
          {...register('content', {
            required: 'This field is required',
          })}
        />
        <div className="flex justify-end gap-6">
          <Button disabled={!isValid}>Send</Button>
        </div>
      </form>
    </div>
  )
}

export default SendCustomEmail
