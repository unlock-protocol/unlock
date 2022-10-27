import { Input, TextBox } from '@unlock-protocol/ui'
import { useFormContext } from 'react-hook-form'
import { Disclosure } from '@headlessui/react'
import {
  RiArrowDropUpLine as UpIcon,
  RiArrowDropDownLine as DownIcon,
} from 'react-icons/ri'

interface Props {
  disabled?: boolean
}

export function LockDetailForm({ disabled }: Props) {
  const { register } = useFormContext()
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
                disabled={disabled}
                type="text"
                placeholder="LockSmith Daily Membership"
                label="Name"
                description="The name will appear as the NFT name, not as collection name."
              />
              <Input
                {...register('external_url')}
                disabled={disabled}
                type="url"
                placeholder="https://example.com"
                label="External URL"
                description="Included a link in your NFT, so members can learn more about it."
              />
              <TextBox
                {...register('description')}
                disabled={disabled}
                label="Description"
                placeholder="Daily NFT membership lock"
                rows={4}
              />
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </div>
  )
}
