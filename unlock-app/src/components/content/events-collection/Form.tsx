'use client'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import {
  Button,
  Disclosure,
  TextBox,
  ImageUpload,
  AddressInput,
  Input,
} from '@unlock-protocol/ui'
import { useImageUpload } from '~/hooks/useImageUpload'
import { useRouter } from 'next/navigation'
import { FiTrash as TrashIcon } from 'react-icons/fi'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useEffect, useState } from 'react'
import { onResolveName } from '~/utils/resolvers'
import LinkField from './LinkField'

interface Link {
  type: 'farcaster' | 'x' | 'website' | 'youtube' | 'github'
  url: string
}

export interface NewEventCollectionForm {
  title: string
  description: string
  coverImage: string
  banner: string
  managerAddresses: string[]
  links: Link[]
}

interface FormProps {
  onSubmit: (data: NewEventCollectionForm) => void
  compact?: boolean
}

export const EventCollectionForm = ({
  onSubmit,
  compact = false,
}: FormProps) => {
  const { mutateAsync: uploadImage, isPending: isUploading } = useImageUpload()
  const router = useRouter()
  const { account } = useAuth()
  const [isAccountManager, setIsAccountManager] = useState<boolean>(true)

  const methods = useForm<NewEventCollectionForm>({
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      coverImage: '',
      banner: '',
      managerAddresses: account ? [account] : [],
      links: [],
    },
  })

  const {
    register,
    setValue,
    watch,
    control,
    formState: { errors, isValid },
  } = methods

  const coverImage = watch('coverImage')
  const banner = watch('banner')
  const managerAddresses = watch('managerAddresses')
  const links = watch('links')

  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({
    control,
    name: 'links',
  })

  const {
    fields: managerFields,
    append: appendManager,
    remove: removeManager,
  } = useFieldArray({
    control,
    name: 'managerAddresses',
  })

  useEffect(() => {
    if (account && managerFields.length === 0) {
      appendManager(account)
    }
  }, [account, appendManager, managerFields.length])

  const handleManagerChange = (index: number, value: string) => {
    if (value) {
      setValue(`managerAddresses.${index}`, value)
    }
  }

  const handleAccountChange = () => {
    // Remove the account from managerAddresses
    removeManager(0)
    setIsAccountManager(false)
  }

  // Check if the last manager field is filled
  const isLastManagerFilled =
    managerFields.length === 0 ||
    managerAddresses[managerFields.length - 1].trim() !== ''

  // Check if the last link field is filled
  const isLastLinkFilled =
    linkFields.length === 0 ||
    (links[linkFields.length - 1].type &&
      links[linkFields.length - 1].url.trim() !== '')

  return (
    <FormProvider {...methods}>
      {!compact && (
        <div className="grid grid-cols-[50px_1fr_50px] items-center mb-4">
          <Button variant="borderless" aria-label="arrow back">
            <ArrowBackIcon
              size={20}
              className="cursor-pointer"
              onClick={() => router.back()}
            />
          </Button>
          <h1 className="text-xl font-bold text-center text-brand-dark">
            Create an Event Collection
          </h1>
        </div>
      )}

      <form className="mb-6" onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          {/* Basic Information */}
          <Disclosure label="Basic Information" defaultOpen>
            <p className="mb-5">
              All of these fields can also be adjusted later.
            </p>

            <div
              className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6`}
            >
              <div className={`${compact ? 'order-2' : 'order-2 md:order-1'}`}>
                <ImageUpload
                  description="This image will be used as the cover for your event collection. Use 512 by 512 pixels for best results."
                  isUploading={isUploading}
                  preview={coverImage}
                  onChange={async (fileOrFileUrl: any) => {
                    if (typeof fileOrFileUrl === 'string') {
                      setValue('coverImage', fileOrFileUrl)
                    } else {
                      const items = await uploadImage(fileOrFileUrl[0])
                      const image = items?.[0]?.publicUrl
                      if (image) {
                        setValue('coverImage', image)
                      }
                    }
                  }}
                />
                {errors.coverImage && (
                  <p className="text-red-500 text-sm">
                    {errors.coverImage.message}
                  </p>
                )}
              </div>
              <div
                className={`grid ${compact ? 'order-1' : 'order-1 md:order-2'} ${compact ? 'gap-2' : 'md:gap-4 gap-2'}`}
              >
                <Input
                  {...register('title')}
                  type="text"
                  className="p-0"
                  placeholder="Title"
                  label="Collection Title"
                  description="Enter the title of your event collection."
                />

                <TextBox
                  {...register('description')}
                  label="Description"
                  placeholder="Write description here."
                  description="Enter a description for your event collection."
                  rows={10}
                />
              </div>
            </div>
          </Disclosure>

          {/* Banner */}
          <Disclosure label="Banner" defaultOpen>
            <div className="grid gap-6">
              <ImageUpload
                description="This banner will be used as the banner for your event collection. The recommended aspect ratio is 1400x300."
                isUploading={isUploading}
                size="full"
                imageRatio="cover"
                preview={banner}
                onChange={async (fileOrFileUrl: any) => {
                  if (typeof fileOrFileUrl === 'string') {
                    setValue('banner', fileOrFileUrl)
                  } else {
                    const items = await uploadImage(fileOrFileUrl[0])
                    const image = items?.[0]?.publicUrl
                    if (image) {
                      setValue('banner', image)
                    }
                  }
                }}
              />
              {errors.banner && (
                <p className="text-red-500 text-sm">{errors.banner.message}</p>
              )}
            </div>
          </Disclosure>

          {/* Collection Creators/Managers */}
          <Disclosure label="Collection Creators/Managers" defaultOpen>
            <div className="space-y-4">
              {managerFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-4 w-full">
                  {index === 0 && isAccountManager ? (
                    <div className="flex items-center pl-4 pr-2 py-4 justify-between bg-gray-200 rounded-md w-full">
                      <div className="w-32 text-sm truncate">{account}</div>
                      <Button
                        type="button"
                        size="tiny"
                        onClick={handleAccountChange}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-grow">
                      <AddressInput
                        withIcon
                        {...register(`managerAddresses.${index}`, {
                          required: 'Manager address is required',
                        })}
                        placeholder="0x..."
                        onChange={(value: string) =>
                          handleManagerChange(index, value)
                        }
                        required
                        onResolveName={onResolveName}
                      />
                      {errors.managerAddresses &&
                        errors.managerAddresses[index]?.message && (
                          <p className="text-red-500 text-sm">
                            {errors.managerAddresses[index].message}
                          </p>
                        )}
                    </div>
                  )}
                  {/* Show trash icon only if it's not the first account manager */}
                  {!(index === 0 && account) && (
                    <div className="flex items-center">
                      <Button
                        variant="borderless"
                        aria-label="Remove manager"
                        onClick={() => removeManager(index)}
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              <Button
                aria-label="Add manager"
                className="flex items-center gap-2 w-full"
                type="button"
                onClick={() => appendManager('')}
                disabled={!isLastManagerFilled}
              >
                {managerFields.length > 0
                  ? 'Add another Manager'
                  : 'Add Manager'}
              </Button>
            </div>
          </Disclosure>

          {/* Links */}
          <Disclosure label="Links" defaultOpen>
            <div className="space-y-4 w-full">
              {linkFields.length === 0 ? (
                <LinkField key="default" index={0} remove={() => {}} />
              ) : (
                linkFields.map((field, index) => (
                  <LinkField key={field.id} index={index} remove={removeLink} />
                ))
              )}
              <Button
                className="flex items-center gap-2 w-full"
                type="button"
                onClick={() => appendLink({ type: 'website', url: '' })}
                disabled={!isLastLinkFilled}
              >
                {linkFields.length > 0 ? 'Add another Link' : 'Add Link'}
              </Button>
            </div>
          </Disclosure>

          {/* Submit Button */}
          <div className="flex flex-col justify-center gap-6">
            <Button type="submit" className="w-full" disabled={!isValid}>
              Create your event collection
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
