import { Input, TextBox } from '@unlock-protocol/ui'
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

export function LockDetailForm({ disabled }: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext<MetadataFormData>()
  const NameDescription = () => (
    <p>
      This will appear as each NFT&apos;s name on OpenSea on other marketplaces.{' '}
      <a
        className="text-brand-ui-primary hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.youtube.com/watch?v=s_Lo2RxPYGA"
      >
        Edit your collection on Opensea
      </a>
    </p>
  )
  return (
    <div className="p-6 bg-white shadow border-xs rounded-xl">
      <Disclosure defaultOpen>
        {({ open }) => (
          <div>
            <Disclosure.Button className="flex items-center justify-between w-full mb-2">
              <h3 className="text-lg font-bold text-brand-ui-primary">Basic</h3>
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
                {...register('name', {
                  required: true,
                })}
                error={errors.name?.message}
                disabled={disabled}
                type="text"
                placeholder="Name"
                label="Name"
                description={<NameDescription />}
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
              <TextBox
                {...register('description')}
                disabled={disabled}
                label="Description"
                placeholder="Write description here."
                description="This is each NFT's description on OpenSea and other marketplaces."
                error={errors.description?.message}
                rows={4}
              />
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </div>
  )
}
