import { Button, Input, Modal, TextBox } from '@unlock-protocol/ui'
import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useCustomEmailSend } from '~/hooks/useCustomEmail'

interface SendCustomEmailData {
  subject: string
  content: string
}

interface SendCustomEmailProps {
  lockAddress: string
  network: number
}
export function SendCustomEmail({
  lockAddress,
  network,
}: SendCustomEmailProps) {
  const form = useForm<SendCustomEmailData>({
    defaultValues: {
      subject: '',
      content: '',
    },
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form
  const [confirm, setIsConfirm] = useState(false)
  const [customEmailData, setCustomEmailData] = useState<SendCustomEmailData>({
    subject: '',
    content: '',
  })
  const { mutateAsync: sendCustomEmail, isPending: isSendingCustomEmail } =
    useCustomEmailSend()
  const onSubmit = useCallback((data: SendCustomEmailData) => {
    setCustomEmailData(data)
    setIsConfirm(true)
  }, [])
  const handleSendEmail = useCallback(
    async (event: React.MouseEvent) => {
      event.preventDefault()
      await sendCustomEmail({
        lockAddress,
        network,
        ...customEmailData,
      })
      setIsConfirm(false)
    },
    [sendCustomEmail, lockAddress, network, customEmailData]
  )
  return (
    <div>
      <Modal isOpen={confirm} setIsOpen={setIsConfirm}>
        <div className="flex flex-col gap-4">
          <header className="leading-relaxed">
            <h1 className="text-xl font-bold">Confirm Email</h1>
            <p className="text-gray-600">
              Are you sure you want to send this email to all the subscribers?
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
            <Button loading={isSendingCustomEmail} onClick={handleSendEmail}>
              Send
            </Button>
          </div>
        </div>
      </Modal>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2">
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
          <Button type="submit"> Send </Button>
        </div>
      </form>
    </div>
  )
}
