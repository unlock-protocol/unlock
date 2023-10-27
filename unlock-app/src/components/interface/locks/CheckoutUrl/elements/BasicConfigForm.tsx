import { BasicPaywallConfigSchema } from '~/unlockTypes'
import { useForm } from 'react-hook-form'
import {
  Input,
  FieldLayout,
  TextBox,
  Button,
  ImageUpload,
  Modal,
} from '@unlock-protocol/ui'
import { z } from 'zod'
import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { useImageUpload } from '~/hooks/useImageUpload'

interface CheckBoxInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  description?: string
}

export const CheckBoxInput = forwardRef<HTMLInputElement, CheckBoxInputProps>(
  ({ label, error, description, ...rest }, ref) => {
    return (
      <FieldLayout size="small" description={description} error={error}>
        <div className="flex items-center gap-3">
          <input
            ref={ref}
            type="checkbox"
            className="cursor-pointer focus:outline-0 hover:outline-0 outline-0 focus:ring-transparent"
            {...rest}
          />
          <label className="text-sm" htmlFor={label}>
            {label}
          </label>
        </div>
      </FieldLayout>
    )
  }
)

CheckBoxInput.displayName = 'CheckBoxInput'

interface Props {
  onChange: (values: z.infer<typeof BasicPaywallConfigSchema>) => void
  defaultValues?: z.infer<typeof BasicPaywallConfigSchema>
}
export const BasicConfigForm = ({ onChange, defaultValues }: Props) => {
  const { mutateAsync: uploadImage, isLoading: isUploading } = useImageUpload()
  const [isOpen, setIsOpen] = useState(false)

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof BasicPaywallConfigSchema>>({
    reValidateMode: 'onChange',
    defaultValues: defaultValues as any,
  })

  const image = watch('icon')
  // Define an onChange handler for each input field
  const handleInputChange = () => {
    const updatedValues = watch() // Get all form values
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
            onChange={async (fileOrFileUrl: any) => {
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
      <Input
        label="Referrer Address"
        size="small"
        description={BasicPaywallConfigSchema.shape.referrer.description}
        error={errors.referrer?.message}
        {...register('referrer', {})}
      />
      <TextBox
        label="Message to Sign"
        size="small"
        description={BasicPaywallConfigSchema.shape.messageToSign.description}
        {...register('messageToSign', {
          required: "Message to Sign can't be empty",
        })}
        error={errors.messageToSign?.message}
      />
      <CheckBoxInput
        label="Persistent Checkout"
        description={
          BasicPaywallConfigSchema.shape.persistentCheckout.description
        }
        error={errors.persistentCheckout?.message}
        {...register('persistentCheckout')}
      />
      <CheckBoxInput
        label="Hide Sold Out Locks"
        description={BasicPaywallConfigSchema.shape.hideSoldOut.description}
        error={errors.hideSoldOut?.message}
        {...register('hideSoldOut')}
      />
      <CheckBoxInput
        label="Skip Recipient"
        description={BasicPaywallConfigSchema.shape.skipRecipient.description}
        error={errors.skipRecipient?.message}
        {...register('skipRecipient')}
      />
      <CheckBoxInput
        label="Skip Select"
        description={BasicPaywallConfigSchema.shape.skipSelect.description}
        error={errors.skipSelect?.message}
        {...register('skipSelect')}
      />
      <CheckBoxInput
        label="Pessimistic"
        description={BasicPaywallConfigSchema.shape.pessimistic.description}
        error={errors.pessimistic?.message}
        {...register('pessimistic')}
      />
    </form>
  )
}
