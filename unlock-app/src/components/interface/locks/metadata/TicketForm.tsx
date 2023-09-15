import { Button, Input, Ticket, Disclosure, Select } from '@unlock-protocol/ui'
import { useFormContext, useWatch, Controller } from 'react-hook-form'
import { MetadataFormData } from './utils'
import { Fragment, useState } from 'react'
import { config } from '~/config/app'
import { Dialog, Transition } from '@headlessui/react'
import Link from 'next/link'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { getEventUrl } from '~/components/content/event/utils'
import dayjs from 'dayjs'

interface Props {
  disabled?: boolean
  lockAddress: string
  network: number
}

export function TicketForm({ disabled, lockAddress, network }: Props) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<MetadataFormData>()

  const [previewTicket, setPreviewTicket] = useState(false)
  const { ticket, name, slug } = useWatch({
    control,
  })

  const eventPageUrl = getEventUrl({
    lockAddress,
    network,
    metadata: {
      slug,
    },
  })

  const today = dayjs().format('YYYY-MM-DD')
  const minEndDate = ticket?.event_start_date ? ticket?.event_start_date : today
  const isSameDay = dayjs(ticket?.event_end_date).isSame(
    ticket?.event_start_date,
    'day'
  )
  const minStartTime = isSameDay ? ticket?.event_start_time : undefined

  const mapAddress = `https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(
    ticket?.event_address || 'Ethereum'
  )}&key=${config.googleMapsApiKey}`

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

      <Disclosure label="Event ticketing">
        <>
          <p>
            Add NFT properties for the event. These will be displayed on NFT
            marketplaces and wallets that support them.
          </p>
          <p className="">
            These properties will also be displayed on{' '}
            <Link
              className="inline-flex items-center underline "
              target="newline"
              href={eventPageUrl}
            >
              your event page <ExternalLinkIcon className="ml-1" />
            </Link>
            .
          </p>
          <div className="grid items-center gap-4 mt-4 align-top sm:grid-cols-2">
            <div className="flex flex-col self-start gap-4 justify-top">
              <div className="h-80">
                <iframe width="100%" height="300" src={mapAddress}></iframe>
              </div>
              <Button
                disabled={disabled}
                size="small"
                variant="outlined-primary"
                onClick={(event: any) => {
                  event.preventDefault()
                  setPreviewTicket(true)
                }}
              >
                Preview ticket
              </Button>
            </div>
            <div className="flex flex-col self-start gap-2 justify-top">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <Input
                  {...register('ticket.event_start_date')}
                  disabled={disabled}
                  type="date"
                  label="Start date"
                  error={errors.ticket?.event_start_date?.message}
                />
                <Input
                  {...register('ticket.event_start_time')}
                  disabled={disabled}
                  type="time"
                  label="Start time"
                  error={errors.ticket?.event_start_time?.message}
                />
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <Input
                  {...register('ticket.event_end_date')}
                  disabled={disabled}
                  type="date"
                  label="End date"
                  min={minEndDate}
                  error={errors.ticket?.event_end_date?.message}
                />
                <Input
                  {...register('ticket.event_end_time')}
                  disabled={disabled}
                  type="time"
                  label="End time"
                  min={minStartTime}
                  error={errors.ticket?.event_end_time?.message}
                />
              </div>

              <Controller
                name="ticket.event_timezone"
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <Select
                      onChange={(newValue) => {
                        onChange({
                          target: {
                            value: newValue,
                          },
                        })
                      }}
                      // @ts-expect-error supportedValuesOf
                      options={Intl.supportedValuesOf('timeZone').map(
                        (tz: string) => {
                          return {
                            value: tz,
                            label: tz,
                          }
                        }
                      )}
                      label="Timezone"
                      defaultValue={
                        value ||
                        Intl.DateTimeFormat().resolvedOptions().timeZone
                      }
                    />
                  )
                }}
              />

              <Input
                {...register('ticket.event_address')}
                disabled={disabled}
                type="text"
                placeholder="123 1st street, 11217 Springfield, US"
                label="Address for in person event"
                error={errors.ticket?.event_address?.message}
              />
              <Input
                disabled={disabled}
                label="Meeting link (if any)"
                placeholder="https://"
                {...register('ticket.event_url')}
                type="url"
                error={errors.ticket?.event_url?.message}
              />
            </div>
          </div>
        </>
      </Disclosure>
    </div>
  )
}
