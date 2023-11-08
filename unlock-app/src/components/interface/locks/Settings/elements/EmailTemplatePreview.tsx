import { useMutation } from '@tanstack/react-query'
import { Button, Input, Modal, TextBox } from '@unlock-protocol/ui'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { storage } from '~/config/storage'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWedlockService } from '~/contexts/WedlocksContext'
import * as z from 'zod'
import React from 'react'
import { RiCloseLine as CloseIcon } from 'react-icons/ri'
import { emailPreviewData, useEmailPreview } from '~/hooks/useEmailPreview'

interface EmailTemplatePreviewProps {
  templateId: string
  disabled: boolean
  network: number
  lockAddress: string
  isManager: boolean
}

const FormSchema = z.object({
  email: z.string().default(''),
  customContent: z.string().default(''),
})

type FormSchemaProps = z.infer<typeof FormSchema>

export const EmailTemplatePreview = ({
  templateId,
  disabled,
  network,
  lockAddress,
  isManager,
}: EmailTemplatePreviewProps) => {
  const [showPreview, setShowPreview] = useState(false)
  const wedlocksService = useWedlockService()

  const { email, customContent, ...rest } = useEmailPreview({
    lockAddress,
    network,
    templateId,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<FormSchemaProps>({
    defaultValues: { customContent },
  })

  const onSaveCustomContent = async ({ customContent }) => {
    console.log('save: ', { customContent })
    const saveEmailPromise = storage.saveCustomEmailContent(
      network,
      lockAddress,
      templateId,
      {
        data: {
          content: customContent,
        },
      }
    )
    await ToastHelper.promise(saveEmailPromise, {
      loading: 'Updating the custom section of the email.',
      error: 'We could not update the custom section of the email.',
      success: 'The custom section of the email was updated successfully!',
    })
    reset({
      customContent: customContent || '',
      email: '',
    })
  }

  const saveCustomContent = useMutation(onSaveCustomContent)

  console.log(rest)

  /**
   * Send preview email
   * @param form
   */
  const onSubmit = async (form: FormSchemaProps) => {
    const params = await emailPreviewData({
      lockAddress,
      network,
      customContent,
    })

    const { data: lockSettings } = await storage.getLockSettings(
      network,
      lockAddress
    )

    const promise = wedlocksService.sendEmail(
      templateId as any,
      form.email,
      {
        ...params,
      },
      [], // attachments
      lockSettings?.replyTo,
      lockSettings?.emailSender
    )
    await ToastHelper.promise(promise, {
      loading: 'Sending email preview...',
      success: 'Email preview sent.',
      error: `Can't send email preview`,
    })
    setShowPreview(false) // close modal after email is sent
  }

  const loading = saveCustomContent.isLoading
  const disableShowPreview = loading || saveCustomContent.isLoading || isDirty

  return (
    <>
      <div className="flex flex-col justify-start gap-3">
        <div className="pb-2">
          <TextBox
            placeholder="## Example content"
            rows={8}
            disabled={disabled}
            {...register('customContent')}
          />
          <div className="pb-2 text-sm text-gray-700">
            <a
              href="https://www.markdownguide.org/cheat-sheet/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-ui-primary"
            >
              Markdown
            </a>{' '}
            is supported for custom email content
          </div>
        </div>
        {isManager && (
          <div className="flex gap-2 ml-auto">
            <Button
              size="small"
              onClick={async () => {
                await saveCustomContent.mutateAsync()
              }}
              loading={saveCustomContent.isLoading}
              disabled={loading}
            >
              Save
            </Button>
            <Button
              size="small"
              variant="outlined-primary"
              onClick={async () => {
                setShowPreview(true)
              }}
              disabled={disableShowPreview}
            >
              Show email preview
            </Button>
          </div>
        )}
        {showPreview && (
          <Modal empty isOpen={showPreview} setIsOpen={setShowPreview}>
            <div className="fixed inset-0 z-10 flex justify-center overflow-y-auto bg-white">
              <div className="w-full max-w-xl mt-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-brand-ui-primary">
                    Preview
                  </h2>
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
                  />
                  <div className="flex flex-col gap-2">
                    <Input
                      placeholder="your@email.com"
                      type="email"
                      disabled={disabled}
                      className="w-full"
                      {...register('email', {
                        required: {
                          value: true,
                          message: 'This field is required.',
                        },
                      })}
                      error={errors?.email?.message}
                    />
                    <Button type="submit" disabled={disabled}>
                      Send email preview
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </>
  )
}

export default EmailTemplatePreview
