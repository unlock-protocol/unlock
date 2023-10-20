import { useState } from 'react'
import Link from 'next/link'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import { useConfig } from '~/utils/withConfig'
import { NextSeo } from 'next-seo'
import {
  Button,
  Card,
  Disclosure,
  Placeholder,
  minifyAddress,
} from '@unlock-protocol/ui'
import AddToCalendarButton from './AddToCalendarButton'
import { TweetItButton } from './TweetItButton'
import { CopyUrlButton } from './CopyUrlButton'
import { getEventDate, getEventEndDate, getEventUrl } from './utils'
import router from 'next/router'
import { useLockManager } from '~/hooks/useLockManager'
import { VerifierForm } from '~/components/interface/locks/Settings/forms/VerifierForm'
import dayjs from 'dayjs'
import { AiOutlineCalendar as CalendarIcon } from 'react-icons/ai'
import { useValidKey } from '~/hooks/useKey'
import { PaywallConfigType, getLockTypeByMetadata } from '@unlock-protocol/core'
import { useLockData } from '~/hooks/useLockData'
import { useCanClaim } from '~/hooks/useCanClaim'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ZERO } from '~/components/interface/locks/Create/modals/SelectCurrencyModal'
import { EventCheckoutUrl } from './EventCheckoutUrl'
import { useGetEventLocksConfig } from '~/hooks/useGetEventLocksConfig'
import useClipboard from 'react-use-clipboard'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { CoverImageDrawer } from './CoverImageDrawer'
import { EventDetail } from './EventDetail'
import { EventLocation } from './EventLocation'
import { RegistrationCard } from './RegistrationCard'

interface EventDetailsProps {
  lockAddress: string
  network: number
  eventData?: any
}

export const EventDetails = ({
  lockAddress,
  network,
  eventData,
}: EventDetailsProps) => {
  const [image, setImage] = useState('')
  const config = useConfig()

  const { isManager: isLockManager } = useLockManager({
    lockAddress,
    network,
  })

  const { locks: eventLocks, isLoading: isLoadingEventLocks } =
    useGetEventLocksConfig({
      lockAddress,
      network,
    })

  const reload = async () => {
    console.log('RELOAD!')
  }

  const eventUrl = getEventUrl({
    lockAddress,
    network,
    eventData,
  })

  const [_, setCopied] = useClipboard(eventUrl, {
    successDuration: 1000,
  })

  if (isLoadingEventLocks) {
    return (
      <Placeholder.Root>
        <Placeholder.Card size="lg" />
        <Placeholder.Root inline>
          <Placeholder.Image size="sm" />
          <Placeholder.Image size="sm" />
          <div className="w-1/3 ml-auto">
            <Placeholder.Card size="md" />
          </div>
        </Placeholder.Root>
        <Placeholder.Line />
        <Placeholder.Line />
        <Placeholder.Line />
      </Placeholder.Root>
    )
  }

  const onEdit = () => {
    return router.push(
      `/locks/metadata?lockAddress=${lockAddress}&network=${network}`
    )
  }

  const eventDate = getEventDate(eventData.ticket)
  const eventEndDate = getEventEndDate(eventData.ticket)

  const isSameDay = dayjs(eventDate).isSame(eventEndDate, 'day')

<<<<<<< HEAD
  const injectedProvider = selectProvider(config)

  const paywallConfig: PaywallConfigType = {
    title: 'Registration',
    icon: metadata?.image,
    locks: {
      [lockAddress]: {
        network,
        emailRequired: true,
        metadataInputs: [
          {
            name: 'fullname',
            label: 'Full name',
            defaultValue: '',
            type: 'text',
            required: true,
            placeholder: 'Satoshi Nakamoto',
            public: false,
          },
        ],
      },
    },
  }

=======
>>>>>>> a70987cf1 (moving lock logic deeper in the stack, on the Registation components)
  const startDate = eventDate
    ? eventDate.toLocaleDateString(undefined, {
        timeZone: eventData?.ticket?.event_timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  const startTime =
    eventDate && eventData.ticket?.event_start_time
      ? eventDate.toLocaleTimeString(navigator.language || 'en-US', {
          timeZone: eventData.ticket.event_timezone,
          hour: '2-digit',
          minute: '2-digit',
        })
      : undefined

  const endDate =
    eventEndDate && eventEndDate && !isSameDay
      ? eventEndDate.toLocaleDateString(undefined, {
          timeZone: eventData?.ticket?.event_timezone,
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : null

  const endTime =
    eventDate && eventData.ticket?.event_end_time && eventEndDate && isSameDay
      ? eventEndDate.toLocaleTimeString(navigator.language || 'en-US', {
          timeZone: eventData.ticket.event_timezone,
          hour: '2-digit',
          minute: '2-digit',
        })
      : null

  const hasLocation = (eventData?.ticket?.event_address || '')?.length > 0
  const hasDate = startDate || startTime || endDate || endTime

  const coverImage = eventData.ticket?.event_cover_image

  const locksmithEventOG = new URL(
    `/v2/og/event/${network}/locks/${lockAddress}`,
    config.locksmithHost
  ).toString()

  return (
    <div>
      <NextSeo
        title={eventData.title}
        description={`${eventData.description}. Powered by Unlock Protocol.`}
        openGraph={{
          images: [
            {
              alt: eventData.title,
              url: locksmithEventOG,
            },
          ],
        }}
      />

      <div className="relative">
        <div className="relative">
          <div className="w-full h-32 overflow-hidden -z-0 bg-slate-200 md:h-80 md:rounded-3xl">
            {coverImage && (
              <img
                className="object-cover w-full h-full"
                src={coverImage}
                alt="Cover image"
              />
            )}
          </div>

          <CoverImageDrawer
            image={image}
            setImage={setImage}
            metadata={eventData}
            lockAddress={lockAddress}
            network={network}
            handleClose={() => {
              console.log('REFETCH!!')
            }}
          />

          <div className="absolute flex flex-col w-full gap-6 px-4 md:px-10 -bottom-12">
            <section className="flex justify-between">
              <div className="flex w-24 h-24 p-1 bg-white md:p-2 md:w-48 md:h-48 rounded-3xl">
                <img
                  alt={eventData.title}
                  className="object-cover w-full m-auto aspect-1 rounded-2xl"
                  src={eventData.image}
                />
              </div>
              <ul className="flex items-center gap-2 mt-auto md:gap-2">
                <li>
                  <AddToCalendarButton event={eventData} />
                </li>
                <li>
                  <TweetItButton event={eventData} />
                </li>
                <li>
                  <CopyUrlButton eventUrl={eventUrl} />
                </li>
              </ul>
            </section>
          </div>
        </div>

        <section className="grid items-start grid-cols-1 md:gap-4 lg:grid-cols-3 mt-14 lg:px-12 lg:mt-28">
          <div className="flex flex-col col-span-3 gap-4 md:col-span-2">
            <h1 className="text-4xl font-bold md:text-7xl">{eventData.name}</h1>
            {/* TODO: How do we handle this? */}
            {/* {!hasCheckoutId && (
              <div className="flex gap-2 flex-rows">
                <span className="text-brand-gray">Ticket contract</span>
                <AddressLink lockAddress={lockAddress} network={network} />
              </div>
            )} */}
            <section className="mt-4">
              <div className="grid grid-cols-1 gap-6 md:p-6 md:grid-cols-2 rounded-2xl">
                {hasDate && (
                  <EventDetail label="Date" icon={CalendarIcon}>
                    <div
                      style={{ color: `#${eventData.background_color}` }}
                      className="flex flex-col text-lg font-normal text-brand-dark"
                    >
                      {(startDate || endDate) && (
                        <span>
                          {startDate} {endDate && <>to {endDate}</>}
                        </span>
                      )}
                      {startTime && endTime && (
                        <span>
                          {startTime} {endTime && <>to {endTime}</>}
                        </span>
                      )}
                    </div>
                  </EventDetail>
                )}
                {hasLocation && <EventLocation eventData={eventData} />}
              </div>
              <div className="mt-14">
                <h2 className="text-2xl font-bold">Event Information</h2>
                {eventData.description && (
                  <div className="mt-4 markdown">
                    {/* eslint-disable-next-line react/no-children-prop */}
                    <ReactMarkdown children={eventData.description} />
                  </div>
                )}
              </div>
            </section>
          </div>
          <RegistrationCard
            lockAddress={lockAddress}
            network={network}
            eventData={eventData}
          />
        </section>
      </div>

      <section className="flex flex-col mb-8">
        {isLockManager && (
          <div className="grid gap-6 mt-12">
            <span className="text-2xl font-bold text-brand-dark">
              Tools for you, the event organizer
            </span>
            <div className="grid gap-4">
              <Card className="grid grid-cols-1 gap-2 md:items-center md:grid-cols-3">
                <div className="md:col-span-2">
                  <Card.Label
                    title="Promote your event"
                    description="Share your event's URL with your community and start selling tickets!"
                  />
                  <pre className="">{eventUrl}</pre>
                </div>
                <div className="md:col-span-1">
                  <Button
                    key={lockAddress}
                    variant="black"
                    className="button border w-full"
                    size="small"
                    onClick={(event) => {
                      event.preventDefault()
                      setCopied()
                      ToastHelper.success('Copied!')
                    }}
                  >
                    Copy URL
                  </Button>
                </div>
              </Card>

              <Card className="grid grid-cols-1 gap-2 md:items-center md:grid-cols-3">
                <div className="md:col-span-2">
                  <Card.Label
                    title="Manage Attendees"
                    description="See who is attending your event, invite people with airdrops and more!"
                  />
                </div>
                <div className="md:col-span-1">
                  {eventLocks?.map(({ lockAddress, network }) => {
                    let label = 'Manage attendees'
                    if (eventLocks.length > 1) {
                      label = `Manage attendees for ${minifyAddress(
                        lockAddress
                      )}`
                    }
                    return (
                      <Button
                        key={lockAddress}
                        as={Link}
                        variant="black"
                        className="button border"
                        size="small"
                        href={`/locks/lock?address=${lockAddress}&network=${network}`}
                      >
                        {label}
                      </Button>
                    )
                  })}
                </div>
              </Card>

              <Card className="grid grid-cols-1 gap-2 md:items-center md:grid-cols-3">
                <div className="md:col-span-2">
                  <Card.Label
                    title="Event details"
                    description="Need to change something? Access your contract (Lock) and update its details."
                  />
                </div>
                <div className="md:col-span-1">
                  <Button
                    onClick={onEdit}
                    variant="black"
                    className="w-full border"
                    size="small"
                  >
                    Edit Details
                  </Button>
                </div>
              </Card>

              <Disclosure
                label="Verifiers"
                description="Add and manage trusted users at the event to help check-in attendees as they arrive."
              >
                <div className="grid gap-2">
                  {eventLocks?.map(({ lockAddress, network }) => {
                    return (
                      <Disclosure
                        label={`Verifiers for ${minifyAddress(lockAddress)}`}
                        key={lockAddress}
                      >
                        <VerifierForm
                          lockAddress={lockAddress}
                          network={network}
                          isManager={isLockManager}
                          disabled={!isLockManager}
                        />
                      </Disclosure>
                    )
                  })}
                </div>
              </Disclosure>

              <Disclosure
                label="Customize the Checkout"
                description="Create a custom checkout experience with your event's name, logo, and ticket multiple ticket tiers."
              >
                <EventCheckoutUrl
                  lockAddress={lockAddress}
                  network={network}
                  isManager={isLockManager}
                  disabled={!isLockManager}
                  onCheckoutChange={reload}
                />
              </Disclosure>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default EventDetails
