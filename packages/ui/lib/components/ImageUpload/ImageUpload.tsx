import { useDropzone } from 'react-dropzone'
import { Button } from '../Button/Button'
import { Tab } from '@headlessui/react'
import { CgSpinner as SpinnerIcon } from 'react-icons/cg'
import { Input } from '../Form'
import { classed } from '@tw-classed/react'

const tabs = [
  {
    id: 1,
    name: 'Upload File',
  },
  {
    id: 2,
    name: 'Insert image URL',
  },
]

const ImageUploadWrapper = classed.div('grid gap-6 p-2 bg-white rounded-xl', {
  variants: {
    size: {
      sm: 'max-w-sm',
      full: 'w-full',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

const ImageContainer = classed.div(
  'flex flex-col items-center p-1 justify-center border border-dashed rounded-lg',
  {
    variants: {
      imageRatio: {
        cover: 'aspect-[16/9]',
        box: 'aspect-1',
      },
    },
    defaultVariants: {
      imageRatio: 'box',
    },
  }
)

export type ImageUploadWrapperProps = React.ComponentProps<
  typeof ImageUploadWrapper
> &
  React.ComponentProps<typeof ImageContainer> & {
    preview: string
    isUploading?: boolean
    onChange: (fileOrFileUrl: File[] | string) => Promise<unknown> | unknown
    description?: string
  }

export const ImageUpload = ({
  onChange,
  preview,
  isUploading,
  description,
  size,
  imageRatio,
  className,
}: ImageUploadWrapperProps) => {
  const { getInputProps, getRootProps } = useDropzone({
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/gif': ['.gif'],
      'image/svg+xml': ['.svg'],
    },
    onDropAccepted: onChange,
  })
  return (
    <ImageUploadWrapper size={size} className={className}>
      <ImageContainer imageRatio={imageRatio}>
        {isUploading && (
          <div className="flex flex-col items-center justify-center h-full ">
            <SpinnerIcon
              size={24}
              title="loading"
              className="text-brand-ui-primary animate-spin"
            />
          </div>
        )}
        {!isUploading &&
          (preview ? (
            <img
              className="object-cover w-full h-full rounded-xl"
              src={preview}
              alt="NFT"
            />
          ) : (
            <div className="text-xs">No image selected</div>
          ))}
      </ImageContainer>
      <Tab.Group>
        <div className="grid gap-4">
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
          <Tab.List className="grid grid-cols-2 border-b border-gray-300">
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                className={({ selected }) =>
                  `w-full text-sm py-2 font-semibold leading-5 ${
                    selected && 'text-ui-main-500 border-b border-ui-main-500'
                  }`
                }
              >
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="h-12">
            <Tab.Panel>
              <div
                {...getRootProps({
                  className: 'grid gap-2',
                })}
              >
                <input {...getInputProps()} />
                <Button size="small" type="button" variant="outlined-primary">
                  Select a file
                </Button>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <Input
                onChange={(event) => {
                  event.preventDefault()
                  const fileUrl = event.target.value
                  onChange(fileUrl)
                }}
                value={preview}
                size="small"
                type="url"
                placeholder="https://"
              />
            </Tab.Panel>
          </Tab.Panels>
        </div>
      </Tab.Group>
    </ImageUploadWrapper>
  )
}
