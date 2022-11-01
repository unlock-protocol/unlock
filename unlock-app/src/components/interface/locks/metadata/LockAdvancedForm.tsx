import { Input } from '@unlock-protocol/ui'
import { useFormContext } from 'react-hook-form'
import { Disclosure } from '@headlessui/react'
import {
  RiArrowDropUpLine as UpIcon,
  RiArrowDropDownLine as DownIcon,
} from 'react-icons/ri'
import { MetadataFormData } from './utils'

interface Props {
  disabled?: boolean
}

export function LockAdvancedForm({ disabled }: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext<MetadataFormData>()
  return (
    <div className="p-6 bg-white shadow border-xs rounded-xl">
      <Disclosure>
        {({ open }) => (
          <div>
            <Disclosure.Button className="flex items-center justify-between w-full mb-2">
              <h3 className="text-lg font-bold text-brand-ui-primary">
                Advanced
              </h3>
              <div>
                {open ? (
                  <UpIcon className="fill-brand-ui-primary" size={24} />
                ) : (
                  <DownIcon className="fill-brand-ui-primary" size={24} />
                )}
              </div>
            </Disclosure.Button>
            <Disclosure.Panel className="grid gap-6">
              <p>
                All properties are used to modify what is displayed on the NFT
                viewer on opensea and other marketplaces.
              </p>
              <Input
                {...register('animation_url')}
                type="url"
                disabled={disabled}
                placeholder="https://"
                label="Animation URL"
                error={errors.animation_url?.message}
                description="A URL to a multi-media attachment for the item. Also supports HTML pages, allowing you to build rich experiences and interactive NFTs using JavaScript canvas, WebGL, and more. "
              />
              <Input
                {...register('youtube_url')}
                type="url"
                disabled={disabled}
                placeholder="https://example.com"
                label="YouTube URL"
                error={errors.youtube_url?.message}
                description="A URL to a YouTube video."
              />
              <Input
                {...register('background_color')}
                description="The color will be rendered as background color of the item on OpenSea."
                label="Background Color"
                disabled={disabled}
                placeholder="Daily NFT membership lock"
                type="color"
                error={errors.background_color?.message}
              />
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </div>
  )
}
