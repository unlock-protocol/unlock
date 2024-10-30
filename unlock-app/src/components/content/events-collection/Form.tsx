'use client'

import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import {
  FormProvider,
  useFieldArray,
  useForm,
  Controller,
} from 'react-hook-form'
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
import { ChangeEvent, useEffect, useState } from 'react'
import { onResolveName } from '~/utils/resolvers'
import { WrappedAddress } from '~/components/interface/WrappedAddress'
import { FiTrash as TrashIcon } from 'react-icons/fi'
import { LinksField } from './LinksField'
import { useAuthenticate } from '~/hooks/useAuthenticate'

interface Links {
  farcaster?: string
  x?: string
  website?: string
  youtube?: string
  github?: string
}

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
  links: Links
}

interface FormProps {
  onSubmit: (data: NewEventCollectionForm) => void
  disabled?: boolean
}

export const EventCollectionForm = ({
  onSubmit,
  disabled = false,
}: FormProps) => {
  const { mutateAsync: uploadImage, isPending: isUploading } = useImageUpload()
  const router = useRouter()
  const { account } = useAuthenticate()
  const [isAccountManager, setIsAccountManager] = useState<boolean>(true)

  // Track if adding a manager is in progress
  const [isAddingManager, setIsAddingManager] = useState<boolean>(false)

  const methods = useForm<NewEventCollectionForm>({
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      coverImage: '',
      banner: '',
      managerAddresses: account ? [account] : [],
      links: {},
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

  const {
    fields: managerFields,
    append: appendManager,
    remove: removeManager,
  } = useFieldArray<NewEventCollectionForm>({
    control,
    // @ts-ignore
    name: 'managerAddresses',
  })

  useEffect(() => {
    if (account && managerFields.length === 0) {
      // @ts-ignore
      appendManager(account)
    }
  }, [account, appendManager, managerFields.length])

  const handleManagerChange = (index: number, value: string) => {
    if (value) {
      setValue(`managerAddresses.${index}`, value)

      // Check if the current index is the last one
      if (index === managerFields.length - 1) {
        if (value.trim() !== '') {
          setIsAddingManager(false)
        }
      }
    }
  }

  const handleAccountChange = () => {
    removeManager(0)
    setIsAccountManager(false)
    setIsAddingManager(false)
  }

  // Check if the last manager field is filled
  const isLastManagerFilled =
    managerFields.length === 0 ||
    managerAddresses[managerFields.length - 1].trim() !== ''

  // Handlers for adding/canceling managers
  const handleAddOrCancelManager = () => {
    if (isAddingManager && !isLastManagerFilled) {
      // Cancel adding: remove the last manager field
      removeManager(managerFields.length - 1)
      setIsAddingManager(false)
    } else {
      // @ts-ignore
      // Start adding a new manager
      appendManager('')
      setIsAddingManager(true)
    }
  }

  // reset isAddingManager when a manager is successfully added
  useEffect(() => {
    if (isAddingManager) {
      const lastManagerAddress = managerAddresses[managerAddresses.length - 1]
      if (lastManagerAddress && lastManagerAddress.trim() !== '') {
        setIsAddingManager(false)
      }
    }
  }, [managerAddresses, isAddingManager])

  // transform links to the correct format
  const handleSubmit = (data: NewEventCollectionForm) => {
    const { links, ...rest } = data
    const transformedLinks: Link[] = Object.entries(links)
      .filter(([_, url]) => url && url.trim() !== '')
      .map(([type, url]) => ({ type: type as Link['type'], url }))

    const finalData: NewEventCollectionForm = {
      ...rest,
      links: transformedLinks as unknown as Links,
    }

    onSubmit(finalData)
  }

  return (
    <FormProvider {...methods}>
      <div className="relative p-5">
        {disabled && (
          <div className="absolute inset-0 bg-gray-200 opacity-50 z-10 p-5 rounded-2xl"></div>
        )}
        {/* Header Section */}
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

        <form className="mb-6" onSubmit={methods.handleSubmit(handleSubmit)}>
          <div className="grid gap-6">
            {/* Basic Information */}
            <Disclosure label="Basic Information" defaultOpen>
              <p className="mb-5">
                All of these fields can also be adjusted later.
              </p>

              <div className="flex flex-col-reverse md:flex-row md:space-x-6 space-y-6 md:space-y-0">
                {/* Cover Image */}
                <div className="flex-shrink-0 md:w-1/2 mt-2 md:mt-0">
                  <ImageUpload
                    description="This image will be used as the cover for your event collection. Use 512 by 512 pixels for best results."
                    isUploading={isUploading}
                    preview={coverImage}
                    error={errors.coverImage?.message}
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
                </div>

                {/* Title and Description */}
                <div className="flex flex-col md:w-1/2 space-y-6">
                  <Input
                    {...register('title', {
                      required: 'Title is required',
                      minLength: {
                        value: 3,
                        message: 'Title must be at least 3 characters',
                      },
                    })}
                    type="text"
                    className="p-0"
                    placeholder="Title"
                    label="Collection Title"
                    description="Enter the title of your event collection."
                    error={errors.title?.message}
                  />
                  <TextBox
                    {...register('description', {
                      required: 'Description is required',
                      minLength: {
                        value: 10,
                        message: 'Description must be at least 10 characters',
                      },
                    })}
                    label="Description"
                    placeholder="Write description here."
                    description="Enter a description for your event collection."
                    rows={10}
                    error={errors.description?.message}
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
                  error={errors.banner?.message}
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
              </div>
            </Disclosure>

            {/* Collection Creators/Managers */}
            <Disclosure label="Collection Creators/Managers" defaultOpen>
              <div className="space-y-4">
                {managerFields.map((field, index) => (
                  <div key={field.id} className="flex flex-col w-full">
                    <div className="flex items-center gap-4 w-full">
                      {index === 0 && isAccountManager ? (
                        <div className="flex items-center pl-4 pr-2 py-2 justify-between bg-gray-200 rounded-md w-full">
                          <div className="flex-grow text-sm truncate">
                            <WrappedAddress
                              address={account!}
                              showCopyIcon={false}
                              showExternalLink={false}
                            />
                          </div>
                          <Button
                            type="button"
                            size="tiny"
                            onClick={handleAccountChange}
                          >
                            Change
                          </Button>
                        </div>
                      ) : (
                        <div className="flex-grow w-full">
                          {managerAddresses[index] ? (
                            <div className="flex items-center justify-between px-4">
                              <WrappedAddress
                                address={managerAddresses[index]}
                                showExternalLink={false}
                              />
                              <Button
                                variant="borderless"
                                aria-label="Remove manager"
                                onClick={() => removeManager(index)}
                              >
                                <TrashIcon />
                              </Button>
                            </div>
                          ) : (
                            <Controller
                              control={control}
                              name={`managerAddresses.${index}`}
                              rules={{
                                required: 'Manager address is required',
                              }}
                              render={({ field }) => (
                                <AddressInput
                                  {...field}
                                  withIcon
                                  placeholder="0x..."
                                  onChange={(
                                    e: ChangeEvent<HTMLInputElement>
                                  ) => {
                                    field.onChange(e)
                                    handleManagerChange(index, e?.target?.value)
                                  }}
                                  required
                                  onResolveName={onResolveName}
                                />
                              )}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  aria-label={
                    isAddingManager ? 'Cancel adding manager' : 'Add manager'
                  }
                  className="flex items-center gap-2 w-full"
                  type="button"
                  onClick={handleAddOrCancelManager}
                  disabled={isAddingManager ? false : !isLastManagerFilled}
                >
                  {isAddingManager && !isLastManagerFilled
                    ? 'Cancel'
                    : 'Add manager'}
                </Button>
              </div>
            </Disclosure>

            {/* Links */}
            <Disclosure label="Links" defaultOpen>
              <LinksField />
            </Disclosure>

            {/* Submit Button */}
            <div className="flex flex-col justify-center gap-6">
              <Button
                type="submit"
                className="w-full"
                disabled={!isValid || isUploading || disabled}
              >
                {isUploading ? 'Uploading...' : 'Create your event collection'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}
