import { useMutation, useQueries } from '@tanstack/react-query'
import { Button, Input, Modal, TextBox } from '@unlock-protocol/ui'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { storage } from '~/config/storage'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWedlockService } from '~/contexts/WedlocksContext'
import * as z from 'zod'
import { useConfig } from '~/utils/withConfig'
import React from 'react'
import { RiCloseLine as CloseIcon } from 'react-icons/ri'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkHtml from 'remark-html'

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

// parse markdown to HTML
const markdownToHtml = async (content: string) => {
  try {
    const parsedContent = await unified()
      .use(remarkParse)
      .use(remarkHtml, {
        sanitize: true,
      })
      .process(content || '')

    return parsedContent?.value?.toString()
  } catch (err: any) {
    console.error(err)
    return ''
  }
}

export const EmailTemplatePreview = ({
  templateId,
  disabled,
  network,
  lockAddress,
  isManager,
}: EmailTemplatePreviewProps) => {
  const config = useConfig()
  const [showPreview, setShowPreview] = useState(true)
  const wedlocksService = useWedlockService()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    reset,
  } = useForm<FormSchemaProps>()

  const customContent = watch('customContent', '')
  const onSaveCustomContent = async () => {
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

  /**
   * Compute params for the email template preview
   * @returns
   */
  const emailPreviewData = async () => {
    const lockImage = `${config.locksmithHost}/lock/${lockAddress}/icon`
    const customContentHtml: string = await markdownToHtml(customContent)
    const { data: eventDetails } = await storage.getEventDetails(
      network,
      lockAddress
    )
    const params = {
      keychainUrl: `${config.unlockApp}/keychain`,
      keyId: 5, // Placeholder!
      network,
      lockImage,
      customContent: customContentHtml,
      ...eventDetails,
      // certificate details
      certificationDetail: '{Certification details}',
    }

    return params
  }

  /**
   * Send preview email
   * @param form
   */
  const onSubmit = async (form: FormSchemaProps) => {
    const params = await emailPreviewData()

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

  const [_data, { data: email }] = useQueries({
    queries: [
      {
        queryKey: ['getCustomContent', network, lockAddress, templateId],
        queryFn: async () => {
          const res = await storage.getCustomEmailContent(
            network,
            lockAddress,
            templateId
          )
          return res?.data?.content || ''
        },
        onSuccess: (content: any) => {
          setValue('customContent', content || '')
        },
        enabled: !disabled,
      },
      {
        queryKey: [
          'getEmailPreview',
          network,
          lockAddress,
          templateId,
          saveCustomContent.isSuccess,
          customContent,
        ],
        queryFn: async () => {
          const url = new URL(
            `${config.services.wedlocks.host}/preview/${templateId}`
          )

          const params = await emailPreviewData()

          // add all params in URL
          Object.entries(params).map(([key, value]) => {
            url.searchParams.append(key, value.toString())
          })

          return (
            await fetch(url, {
              headers: {
                accept: 'application/json',
              },
            })
          ).json()
        },
      },
    ],
  })

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
                  ></div>
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
