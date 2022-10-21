import { Input } from '@unlock-protocol/ui'
import { useFormContext } from 'react-hook-form'
import { Disclosure } from '@headlessui/react'
import {
  RiArrowDropUpLine as UpIcon,
  RiArrowDropDownLine as DownIcon,
} from 'react-icons/ri'

export function LockAdvancedForm() {
  const { register } = useFormContext()
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
            <Disclosure.Panel className="space-y-6">
              <Input
                {...register('animation_url')}
                type="url"
                placeholder="https://"
                label="Animation URL"
                description="A URL to a multi-media attachment for the item. Also supports HTML pages, allowing you to build rich experiences and interactive NFTs using JavaScript canvas, WebGL, and more. "
              />
              <Input
                {...register('youtube_url')}
                type="url"
                placeholder="https://example.com"
                label="Youtube URL"
                description="A URL to a YouTube video."
              />
              <Input
                {...register('background_color')}
                label="Background Color"
                placeholder="Daily NFT membership lock"
                type="color"
                className="The color will be rendered as background color of the item on OpenSea."
              />
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </div>
  )
}
