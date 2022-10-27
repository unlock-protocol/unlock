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

export function LockTicketForm({ disabled }: Props) {
  const { register } = useFormContext<MetadataFormData>()
  return (
    <div className="p-6 bg-white shadow border-xs rounded-xl">
      <Disclosure>
        {({ open }) => (
          <div>
            <Disclosure.Button className="flex items-center justify-between w-full mb-2">
              <h3 className="text-lg font-bold text-brand-ui-primary">
                Event ticketing
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
                {...register('ticket.event_start_date')}
                disabled={disabled}
                type="date"
                label="Date"
              />
              <Input
                {...register('ticket.event_start_time')}
                disabled={disabled}
                type="time"
                label="Time"
              />
              <Input
                {...register('ticket.event_address')}
                disabled={disabled}
                type="text"
                placeholder="123, Street, NYC"
                label="Address for in person event"
              />
              <Input
                disabled={disabled}
                label="Meeting link (if any)"
                placeholder="https://"
                {...register('ticket.event_meeting_url')}
                type="url"
              />
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </div>
  )
}
