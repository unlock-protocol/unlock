import { BasicPaywallConfigSchema } from '~/unlockTypes'
import { type DefaultValues, useForm } from 'react-hook-form'
import {
  Input,
  Checkbox,
  Button,
  ImageUpload,
  Modal,
} from '@unlock-protocol/ui'
import { z } from 'zod'
import { useState } from 'react'
import { useImageUpload } from '~/hooks/useImageUpload'

interface Props {
  onChange: (values: z.infer<typeof BasicPaywallConfigSchema>) => void
  defaultValues?: z.infer<typeof BasicPaywallConfigSchema>
}
export const BasicConfigForm = ({ onChange, defaultValues }: Props) => {
  const { mutateAsync: uploadImage, isPending: isUploading } = useImageUpload()
  const [isOpen, setIsOpen] = useState(false)
  type BasicPaywallConfig = z.infer<typeof BasicPaywallConfigSchema>

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BasicPaywallConfig>({
    reValidateMode: 'onChange',
    defaultValues: defaultValues as
      | DefaultValues<BasicPaywallConfig>
      | undefined,
  })

  const image = watch('icon')
  // Define an onChange handler for each input field
  const handleInputChange = () => {
    const updatedValues = watch() // Get all form values
    if (!updatedValues.accentColor) {
      delete updatedValues.accentColor
    }
    onChange(updatedValues) // Call the onChange prop with updated values
  }

  return (
    <form
      className="grid gap-6"
      onChange={() => {
        handleInputChange()
      }}
    >
      <Button
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setIsOpen(true)
        }}
      >
        Change Icon
      </Button>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="p-2">
          <ImageUpload
            size="full"
            className="mx-auto"
            description="Upload an image to use as the icon for your checkout"
            isUploading={isUploading}
            preview={image!}
            onChange={async (fileOrFileUrl: File[] | string) => {
              let icon = fileOrFileUrl
              if (typeof fileOrFileUrl !== 'string') {
                const items = await uploadImage(fileOrFileUrl[0])
                icon = items?.[0]?.publicUrl
                if (!icon) {
                  return
                }
              }
              setValue('icon', icon)
              handleInputChange()
            }}
          />
        </div>
      </Modal>
      <Input
        label="Title"
        size="small"
        description={BasicPaywallConfigSchema.shape.title.description}
        {...register('title', {
          required: "Title can't be empty",
        })}
        error={errors.title?.message}
      />

      <Input
        label="Accent Color"
        size="small"
        placeholder="#603DEB"
        description={BasicPaywallConfigSchema.shape.accentColor.description}
        {...register('accentColor', {
          pattern: {
            value: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
            message: 'Use a hex color like #603DEB.',
          },
        })}
        error={errors.accentColor?.message}
      />

      <Input
        label="Referrer Address"
        size="small"
        description={BasicPaywallConfigSchema.shape.referrer.description}
        error={errors.referrer?.message}
        {...register('referrer', {})}
      />

      <Input
        label="Redirect URL"
        size="small"
        description={BasicPaywallConfigSchema.shape.redirectUri.description}
        {...register('redirectUri', {
          required: "Redirect URL can't be empty",
        })}
        error={errors.redirectUri?.message}
      />
      <Input
        label="Redirect Button Text"
        size="small"
        description={
          BasicPaywallConfigSchema.shape.endingCallToAction.description
        }
        {...register('endingCallToAction', {
          required: "Redirect Button Text can't be empty",
        })}
        error={errors.endingCallToAction?.message}
      />

      {/* Deprecated, replaced by SIWE */}
      {/* <TextBox
        label="Message to Sign"
        size="small"
        description={BasicPaywallConfigSchema.shape.messageToSign.description}
        {...register('messageToSign', {
          required: "Message to Sign can't be empty",
        })}
        error={errors.messageToSign?.message}
      /> */}
      <Checkbox
        label="Persistent Checkout"
        description={
          BasicPaywallConfigSchema.shape.persistentCheckout.description
        }
        error={errors.persistentCheckout?.message}
        {...register('persistentCheckout')}
      />
      <Checkbox
        label="Hide Sold Out Locks"
        description={BasicPaywallConfigSchema.shape.hideSoldOut.description}
        error={errors.hideSoldOut?.message}
        {...register('hideSoldOut')}
      />
      <Checkbox
        label="Skip Recipient"
        description={BasicPaywallConfigSchema.shape.skipRecipient.description}
        error={errors.skipRecipient?.message}
        {...register('skipRecipient')}
      />
      <Checkbox
        label="Skip Select"
        description={BasicPaywallConfigSchema.shape.skipSelect.description}
        error={errors.skipSelect?.message}
        {...register('skipSelect')}
      />
      <Checkbox
        label="Pessimistic"
        description={BasicPaywallConfigSchema.shape.pessimistic.description}
        error={errors.pessimistic?.message}
        {...register('pessimistic')}
      />
    </form>
  )
}
