import { Button, Input, Ticket } from '@unlock-protocol/ui'
import { useFormContext, useWatch } from 'react-hook-form'
import { Disclosure, Dialog, Transition } from '@headlessui/react'
import {
  RiArrowDropUpLine as UpIcon,
  RiArrowDropDownLine as DownIcon,
} from 'react-icons/ri'
import { MetadataFormData } from './utils'
import { Fragment, useState } from 'react'
import { config } from '~/config/app'

interface Props {
  disabled?: boolean
  lockAddress: string
  network: number
}

export function LockTicketForm({ disabled, lockAddress, network }: Props) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<MetadataFormData>()

  const [previewTicket, setPreviewTicket] = useState(false)
  const { ticket, name } = useWatch({
    control,
  })

  return (
    <div>
      <Transition.Root show={previewTicket} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={setPreviewTicket}
        >
          <div className="flex flex-col items-center justify-center min-h-screen p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-50 backdrop-blur" />
            </Transition.Child>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="block overflow-hidden transition-all transform">
                <Ticket
                  iconURL={`${config.locksmithHost}/lock/${lockAddress}/icon`}
                  title={name || 'Lock Name'}
                  recipient="user.eth"
                  QRCodeURL="/images/qrcode.png"
                  network={network}
                  lockAddress={lockAddress}
                  id={'-'}
                  location={ticket?.event_address}
                  date={ticket?.event_start_date}
                  time={ticket?.event_start_time}
                />
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
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
              <Disclosure.Panel>
                <p>Add properties for your ticketing event.</p>
                <div className="grid items-center gap-12 mt-2 sm:grid-cols-2">
                  <div className="flex flex-col justify-center gap-6">
                    <img src="/images/map.png" alt="map" />
                    <Button
                      disabled={disabled}
                      size="small"
                      variant="outlined-primary"
                      onClick={(event) => {
                        event.preventDefault()
                        setPreviewTicket(true)
                      }}
                    >
                      Preview QR Ticket
                    </Button>
                  </div>
                  <div className="grid gap-y-6">
                    <Input
                      {...register('ticket.event_start_date')}
                      disabled={disabled}
                      type="date"
                      label="Date"
                      error={errors.ticket?.event_start_date?.message}
                    />
                    <Input
                      {...register('ticket.event_start_time')}
                      disabled={disabled}
                      type="time"
                      label="Time"
                      error={errors.ticket?.event_start_time?.message}
                    />
                    <Input
                      {...register('ticket.event_address')}
                      disabled={disabled}
                      type="text"
                      placeholder="123, Street, NYC"
                      label="Address for in person event"
                      error={errors.ticket?.event_address?.message}
                    />
                    <Input
                      disabled={disabled}
                      label="Meeting link (if any)"
                      placeholder="https://"
                      {...register('ticket.event_meeting_url')}
                      type="url"
                      error={errors.ticket?.event_url?.message}
                    />
                  </div>
                </div>
              </Disclosure.Panel>
            </div>
          )}
        </Disclosure>
      </div>
    </div>
  )
}
