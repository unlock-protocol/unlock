import { Disclosure, Input, TextBox, ImageUpload } from '@unlock-protocol/ui'
import { useFormContext, useWatch } from 'react-hook-form'
import { MetadataFormData } from './utils'
import { useImageUpload } from '~/hooks/useImageUpload'
import { SLUG_REGEXP } from '~/constants'
import { storage } from '~/config/storage'

interface Props {
  disabled?: boolean
  defaultValues?: any
}

export function DetailForm({ disabled, defaultValues }: Props) {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<MetadataFormData>()
  const { mutateAsync: uploadImage, isLoading: isUploading } = useImageUpload()

  const { image } = useWatch({
    control,
  })

  const NameDescription = () => (
    <p>
      This will appear as each NFT&apos;s name on OpenSea on other marketplaces.{' '}
      <a
        className="text-brand-ui-primary hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.youtube.com/watch?v=s_Lo2RxPYGA"
      >
        Edit your collection on Opensea.
      </a>
    </p>
  )

  const DescDescription = () => (
    <p>
      This is each NFT&apos;s description on OpenSea and other marketplaces.{' '}
      <a
        className="text-brand-ui-primary hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.markdownguide.org/cheat-sheet"
      >
        Markdown is supported.
      </a>
    </p>
  )

  return (
    <Disclosure label="Basic" defaultOpen>
      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <ImageUpload
              description="This will appear as each NFT's image on OpenSea on other marketplaces. Use 512 by 512 pixels for best results."
              isUploading={isUploading}
              preview={image!}
              onChange={async (fileOrFileUrl: any) => {
                if (typeof fileOrFileUrl === 'string') {
                  setValue('image', fileOrFileUrl)
                } else {
                  const items = await uploadImage(fileOrFileUrl[0])
                  const image = items?.[0]?.publicUrl
                  if (!image) {
                    return
                  }
                  setValue('image', image)
                }
              }}
            />
          </div>
          <div className="grid order-1 gap-6 md:order-2">
            <Input
              {...register('name', {
                required: {
                  value: true,
                  message: 'Name is required',
                },
              })}
              error={errors.name?.message}
              disabled={disabled}
              type="text"
              placeholder="Name"
              label="Name"
              description={<NameDescription />}
            />
            <TextBox
              {...register('description')}
              disabled={disabled}
              label="Description"
              placeholder="Write description here."
              description={<DescDescription />}
              error={errors.description?.message}
              rows={4}
            />
            <Input
              {...register('slug', {
                pattern: {
                  value: SLUG_REGEXP,
                  message: 'Slug format is not valid',
                },
                validate: async (slug: string | undefined) => {
                  const slugChanged = defaultValues?.slug !== slug
                  if (slugChanged && slug) {
                    const data = (await storage.getLockSettingsBySlug(slug))
                      .data
                    return data
                      ? 'Slug already used, please use another one'
                      : true
                  }
                  return true
                },
              })}
              disabled={disabled || defaultValues?.slug}
              type="text"
              label="Custom URL"
              error={errors.slug?.message}
              description="Custom URL that will be used for the page."
            />
            <Input
              {...register('external_url')}
              disabled={disabled}
              type="url"
              placeholder="https://"
              label="External URL"
              error={errors.external_url?.message}
              description="Include a link in the NFT, so members can learn more about it."
            />
          </div>
        </div>
      </div>
    </Disclosure>
  )
}
