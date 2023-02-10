import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Input, Modal, TextBox } from '@unlock-protocol/ui'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { storage } from '~/config/storage'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWedlockService } from '~/contexts/WedlocksContext'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import * as z from 'zod'
interface EmailTemplatePreviewProps {
  templateId: string
  disabled: boolean
  network: number
  lockAddress: string
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
}: EmailTemplatePreviewProps) => {
  const [showPreview, setShowPreview] = useState(false)
  const wedlocksService = useWedlockService()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
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
      loading: 'Updating custom email content...',
      error: 'Could not update custom email content.',
      success: 'Custom email content updated.',
    })
  }

  const saveCustomContent = useMutation(onSaveCustomContent)

  const onSubmit = async (form: FormSchemaProps) => {
    await saveCustomContent.mutateAsync() // save custom content
    await wedlocksService.sendEmail(templateId as any, form.email)
  }

  useQuery(
    ['getCustomContent', network, lockAddress, templateId],
    async () => {
      const res = await storage.getCustomEmailContent(
        network,
        lockAddress,
        templateId
      )
      return res?.data?.content || ''
    },
    {
      onSuccess: (content: any) => {
        setValue('customContent', content || '')
      },
      enabled: !disabled,
    }
  )

  const loading = saveCustomContent.isLoading

  return (
    <>
      <div className="flex flex-col justify-start gap-3">
        <div className="pb-2">
          <TextBox
            placeholder="## Example content"
            rows={8}
            {...register('customContent')}
          />
          <div className="text-sm text-gray-700">
            Markdown is supported for custom email content
          </div>
        </div>
        <div className="flex gap-2 ml-auto">
          <Button
            size="small"
            variant="outlined-primary"
            onClick={() => setShowPreview(!showPreview)}
            disabled={loading}
          >
            Show preview
          </Button>
        </div>
        {showPreview && (
          <Modal isOpen={showPreview} setIsOpen={setShowPreview}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col w-full gap-6 py-4"
            >
              <ReactMarkdown>{customContent}</ReactMarkdown>
              <div className="text-sm text-gray-700">Send</div>
              <div className="flex flex-col gap-2">
                <Input
                  placeholder="example@email.com"
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
                  Save & send email Preview
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </>
  )
}
