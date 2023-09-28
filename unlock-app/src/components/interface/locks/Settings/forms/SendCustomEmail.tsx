import { Button, Input, Modal, TextBox } from '@unlock-protocol/ui'
import { useState } from 'react'
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SendCustomEmailData>()
  const [confirm, setIsConfirm] = useState(false)
  const [customEmailData, setCustomEmailData] = useState<SendCustomEmailData>({
    subject: '',
    content: '',
  })
  const { mutateAsync: sendCustomEmail, isLoading: isSendingCustomEmail } =
    useCustomEmailSend()
  const onSubmit = (data: SendCustomEmailData) => {
    setCustomEmailData(data)
    setIsConfirm(true)
  }
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
            <Button
              loading={isSendingCustomEmail}
              onClick={async (event) => {
                event.preventDefault()
                await sendCustomEmail({
                  lockAddress,
                  network,
                  ...customEmailData,
                })
                setIsConfirm(false)
              }}
            >
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
          description="The content of the email"
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
