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
}

export const SendCustomEmail = ({ event, checkoutConfig }: EmailsProps) => {
  const [confirm, setIsConfirm] = useState(false)
  const { mutateAsync: sendCustomEmail, isLoading: isSendingCustomEmail } =
    useCustomEmailSend()
  const onSubmit = (data: SendCustomEmailData) => {
    console.log(data)
    setIsConfirm(true)
    // sendCustomEmail()
    return false
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SendCustomEmailData>()

  const locks = useMultipleLockData(checkoutConfig.config.locks)
  return (
    <div>
      <Modal isOpen={confirm} setIsOpen={setIsConfirm}>
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
              disabled={isSendingCustomEmail}
              variant="outlined-primary"
              onClick={() => setIsConfirm(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isSendingCustomEmail}>
              Send
            </Button>
          </div>
        </div>
      </Modal>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2">
        <p> Cool!</p>
        <ul className="flex gap-4">
          {locks.map(({ lock, isLockLoading }, index) => {
            if (isLockLoading) {
              return (
                <Placeholder.Root key={index}>
                  <Placeholder.Line width="sm" />
                </Placeholder.Root>
              )
            } else {
              return <Checkbox key={index} label={lock.name} />
            }
          })}
        </ul>
        <p>Still cool!</p>{' '}
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
          <Button type="submit">Send</Button>
        </div>
      </form>
    </div>
  )
}

export default SendCustomEmail
