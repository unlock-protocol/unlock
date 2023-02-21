import { useDropzone } from 'react-dropzone'
import { Button } from '../Button/Button'
import { Tab } from '@headlessui/react'
import { CgSpinner as SpinnerIcon } from 'react-icons/cg'
import { Input } from '../Form'

interface ImageUploadProps {
  preview: string
  isUploading?: boolean
  onChange: (fileOrFileUrl: File[] | string) => Promise<unknown> | unknown
  description?: string
}

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
export const ImageUpload = ({
  onChange,
  preview,
  isUploading,
  description,
}: ImageUploadProps) => {
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
    <div className="grid max-w-sm gap-6 p-2 bg-white rounded-xl">
      <div className="border border-dashed rounded-3xl">
        <div className="flex flex-col object-fill gap-4 aspect-1">
          {isUploading && (
            <div className="flex flex-col items-center justify-center">
              <SpinnerIcon
                title="loading"
                className="text-gray-400 animate-spin"
              />
            </div>
          )}
          {!isUploading && (
            <img className="rounded-xl" src={preview} alt="NFT" />
          )}
        </div>
      </div>

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
                size="small"
                type="url"
                placeholder="https://"
              />
            </Tab.Panel>
          </Tab.Panels>
        </div>
      </Tab.Group>
    </div>
  )
}
