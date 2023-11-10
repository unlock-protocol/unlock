import { useMutation } from '@tanstack/react-query'
import { Button, Modal, Placeholder, TextBox } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { storage } from '~/config/storage'
import { ToastHelper } from '~/components/helpers/toast.helper'
import * as z from 'zod'
import React from 'react'
import {
  useCustomContentForEmail,
  useEmailPreviewDataForLock,
} from '~/hooks/useEmailPreview'
import { EmailPreview } from './EmailPreview'

interface EmailTemplatePreviewProps {
  templateId: string
  disabled: boolean
  network: number
  lockAddress: string
  isManager: boolean
  sendingParams: {
    replyTo?: string
    emailSender?: string
  }
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
  sendingParams,
}: EmailTemplatePreviewProps) => {
  const [showPreview, setShowPreview] = useState(false)

  const {
    data: customContent,
    isLoading: isLoadingCustomContent,
    refetch: refetchCustomContent,
  } = useCustomContentForEmail({
    lockAddress,
    network,
    templateId,
  })

  const { register, getValues, setValue } = useForm<FormSchemaProps>({
    defaultValues: { customContent },
  })

  const {
    data: params,
    // isLoading: isLoadingParams,
    // refetch: refetchParams,
  } = useEmailPreviewDataForLock({
    lockAddress,
    network,
    customContent,
  })

  useEffect(() => {
    if (customContent) {
      setValue('customContent', customContent)
    }
  }, [customContent, setValue])

  const onSaveCustomContent = async () => {
    const customContent = getValues('customContent')
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
    await refetchCustomContent()
    await ToastHelper.promise(saveEmailPromise, {
      loading: 'Updating the custom section of the email.',
      error: 'We could not update the custom section of the email.',
      success: 'The custom section of the email was updated successfully!',
    })
  }

  const saveCustomContent = useMutation(onSaveCustomContent)

  if (isLoadingCustomContent) {
    return (
      <Placeholder.Root>
        <Placeholder.Line size="lg" />
        <Placeholder.Line size="sm" />
        <Placeholder.Line size="sm" />
      </Placeholder.Root>
    )
  }

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
            >
              Save
            </Button>
            <Button
              size="small"
              variant="outlined-primary"
              onClick={async () => {
                setShowPreview(true)
              }}
            >
              Show email preview
            </Button>
          </div>
        )}
        {showPreview && (
          <Modal empty isOpen={showPreview} setIsOpen={setShowPreview}>
            <div className="fixed inset-0 z-10 flex justify-center overflow-y-auto bg-white">
              <EmailPreview
                templateId={templateId}
                setShowPreview={setShowPreview}
                emailParams={params}
                sendingParams={sendingParams}
              />
            </div>
          </Modal>
        )}
      </div>
    </>
  )
}

export default EmailTemplatePreview
