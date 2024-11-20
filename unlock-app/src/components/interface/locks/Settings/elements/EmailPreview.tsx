import { RiCloseLine as CloseIcon } from 'react-icons/ri'
import { Button, Input, Placeholder } from '@unlock-protocol/ui'
import { useWedlockService } from '~/contexts/WedlocksContext'
import { useEmailPreview } from '~/hooks/useEmailPreview'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'

export const EmailPreview = ({
  templateId,
  setShowPreview,
  emailParams,
  sendingParams,
}: {
  templateId: string
  setShowPreview: (show: boolean) => void
  emailParams: any
  sendingParams?: {
    replyTo?: string | null
    emailSender?: string | null
  }
}) => {
  const wedlocksService = useWedlockService()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      emailAddress: '',
    },
  })

  const { data: email, isLoading } = useEmailPreview({
    templateId,
    params: emailParams,
  })

  console.log(sendingParams)
  /**
   * Send preview email
   * @param form
   */
  const onSubmit = async (form: any) => {
    const promise = wedlocksService.sendEmail(
      templateId as any,
      form.emailAddress,
      {
        ...emailParams,
      },
      [], // attachments
      sendingParams?.replyTo,
      sendingParams?.emailSender
    )
    await ToastHelper.promise(promise, {
      loading: 'Sending email preview...',
      success: 'Email preview sent.',
      error: "Can't send email preview",
    })
  }

  return (
    <div className="w-full max-w-xl mt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-ui-primary">Preview</h2>
        <div className="flex items-center justify-end">
          <button
            className="hover:fill-brand-ui-primary"
            aria-label="close"
            onClick={(event) => {
              event.preventDefault()
              setShowPreview(false)
            }}
          >
            <CloseIcon className="fill-inherit" size={24} />
          </button>
        </div>
      </div>
      {isLoading && (
        <Placeholder.Root>
          <Placeholder.Line size="lg" />
          <Placeholder.Line size="sm" />
          <Placeholder.Line size="sm" />
        </Placeholder.Root>
      )}
      {!isLoading && email && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col w-full gap-6 py-4"
        >
          <ul>
            <li>Email subject: {email?.subject}</li>
          </ul>
          <div
            dangerouslySetInnerHTML={{
              __html: email?.html || '',
            }}
            style={{ width: '200px' }}
            className="text-left"
          />
          <div className="flex flex-col gap-2">
            <Input
              placeholder="your@email.com"
              type="email"
              className="w-full"
              {...register('emailAddress', {
                required: {
                  value: true,
                  message: 'This field is required.',
                },
              })}
              error={errors?.emailAddress?.message}
            />
            <Button type="submit">Send email preview</Button>
          </div>
        </form>
      )}
    </div>
  )
}
