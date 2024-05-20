import { BiQrScan as ScanIcon } from 'react-icons/bi'
import { MdAssignmentLate } from 'react-icons/md'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import {
  Button,
  Card,
  Disclosure,
  Icon,
  minifyAddress,
} from '@unlock-protocol/ui'
import AddToCalendarButton from './AddToCalendarButton'
import TweetItButton from './TweetItButton'
import CastItButton from './CastItButton'
import CopyUrlButton from './CopyUrlButton'
import { getEventDate, getEventEndDate, getEventUrl } from './utils'
import { useEventOrganizer } from '~/hooks/useEventOrganizer'
import { useEventOrganizers } from '~/hooks/useEventOrganizers'
import dayjs from 'dayjs'
import { AiOutlineCalendar as CalendarIcon } from 'react-icons/ai'
import { Event, PaywallConfigType } from '@unlock-protocol/core'
import { EventDetail } from './EventDetail'
import { EventLocation } from './EventLocation'
import { RegistrationCard } from './Registration/RegistrationCard'
import { useEvent } from '~/hooks/useEvent'
import { SettingEmail } from '~/components/interface/locks/Settings/elements/SettingEmail'
import { FaUsers } from 'react-icons/fa'
import { TbSettings } from 'react-icons/tb'
import { config } from '~/config/app'
import Hosts from './Hosts'
import removeMd from 'remove-markdown'
import { truncateString } from '~/utils/truncateString'
import { AttendeeCues } from './Registration/AttendeeCues'
import { useEventVerifiers } from '~/hooks/useEventVerifiers'
import ReactMarkdown from 'react-markdown'

interface EventDetailsProps {
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

const language = () => {
  if (typeof navigator === 'undefined') {
    return 'en-US'
  }
  return navigator?.language || 'en-US'
}

export const EventDetails = ({
  event: eventProp,
  checkoutConfig,
}: EventDetailsProps) => {
  const router = useRouter()

  // Check if the user is one of the lock manager
  const { data: isOrganizer } = useEventOrganizer({
    checkoutConfig,
  })

  const { data: event } = useEvent(
    { slug: eventProp.slug },
    { initialData: eventProp }
  )

  const eventUrl = getEventUrl({
    event,
  })

  const { data: organizers } = useEventOrganizers({
    checkoutConfig,
  })

  const { data: verifier } = useEventVerifiers({ event: eventProp })

  const eventDate = getEventDate(event.ticket) // Full date + time of event
  const eventEndDate = getEventEndDate(event.ticket)
  const hasPassed = eventEndDate
    ? dayjs().isAfter(eventEndDate)
    : dayjs().isAfter(eventDate)

  const isSameDay = dayjs(eventDate).isSame(eventEndDate, 'day')

  const startDate = eventDate
    ? eventDate.toLocaleDateString(undefined, {
        timeZone: event.ticket.event_timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  const startTime =
    eventDate && event.ticket.event_start_time
      ? eventDate.toLocaleTimeString(language(), {
          timeZone: event.ticket.event_timezone,
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        })
      : undefined

  const endDate =
    eventEndDate && eventEndDate && !isSameDay
      ? eventEndDate.toLocaleDateString(undefined, {
          timeZone: event.ticket.event_timezone,
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : null

  const endTime =
    eventDate && event.ticket.event_end_time && eventEndDate && isSameDay
      ? eventEndDate.toLocaleTimeString(language(), {
          timeZone: event.ticket.event_timezone,
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        })
      : null

  const hasLocation = (event.ticket.event_address || '')?.length > 0
  const hasDate = startDate || startTime || endDate || endTime

  const SectionComponent = () => {
    return (
      <>
        <div className="flex bg-white p-1 sm:rounded-3xl w-auto h-auto  rounded-xl border">
          <img
            alt={event.title}
            className="object-cover w-full m-auto aspect-1 sm:rounded-2xl rounded-lg"
            src={event.image}
          />
        </div>
        <ul className="flex items-center justify-center pt-2 gap-8 mt-auto md:gap-4 ">
          <li>
            <AddToCalendarButton event={event} eventUrl={eventUrl} />
          </li>
          <li>
            <TweetItButton event={event} eventUrl={eventUrl} />
          </li>
          <li>
            <CastItButton event={event} eventUrl={eventUrl} />
          </li>
          <li>
            <CopyUrlButton url={eventUrl} />
          </li>
        </ul>
      </>
    )
  }

  return (
    <div>
      <NextSeo
        title={event.name}
        description={`${truncateString(
          removeMd(event.description, {
            useImgAltText: false,
          }),
          650
        )} 
        Powered by Unlock Protocol`}
        openGraph={{
          title: event.title,
          type: 'website',
          url: eventUrl,
          images: [
            {
              alt: event.title,
              url: `${config.unlockApp}/og/event/${event.slug}`,
            },
          ],
        }}
        additionalMetaTags={[
          {
            property: 'fc:frame',
            content: 'vNext',
          },
          {
            name: 'fc:frame:image',
            content: `${config.unlockApp}/og/event/${event.slug}`,
          },
          {
            name: 'fc:frame:post_url',
            content: `${config.unlockApp}/frames/event?p=${encodeURIComponent(
              `${config.unlockApp}/frames/event/${event.slug}`
            )}&s=${encodeURIComponent('{"view":"default"}')}`,
          },
          {
            name: 'fc:frame:button:1',
            content: 'Register',
          },
          {
            name: 'fc:frame:button:1:target',
            content: eventUrl,
          },
          {
            name: 'fc:frame:button:1:action',
            content: 'link',
          },
          {
            name: 'fc:frame:button:2',
            content: 'See description',
          },
          {
            name: 'fc:frame:button:2:action',
            content: 'post',
          },
        ]}
      />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col-reverse px-4 md:px-0 md:flex-row-reverse gap-2 ">
          {isOrganizer && (
            <>
              <Button
                onClick={() => {
                  router.push(`/event/${eventProp.slug}/settings`)
                }}
              >
                <div className="flex items-center gap-2">
                  <Icon icon={TbSettings} size={20} />
                  <span>Settings</span>
                </div>
              </Button>
              <Button
                onClick={() => {
                  router.push(`/event/${eventProp.slug}/attendees`)
                }}
              >
                <div className="flex items-center gap-2">
                  <Icon icon={FaUsers} size={20} />
                  <span>Attendees</span>
                </div>
              </Button>
            </>
          )}

          {(verifier || isOrganizer) && (
            <>
              <Button
                onClick={() => {
                  router.push(`/event/${eventProp.slug}/verification`)
                }}
              >
                <div className="flex items-center gap-2">
                  <Icon icon={ScanIcon} size={20} />
                  <span>Verification</span>
                </div>
              </Button>
            </>
          )}
        </div>

        <div className="relative">
          <div className="w-full hidden sm:block sm:overflow-hidden bg-slate-200 max-h-80 sm:rounded-3xl"></div>
          <div className=" flex flex-col w-full gap-6 px-4 sm:px-10 -bottom-12  ">
            <section className="flex flex-col  justify-center items-center md:hidden ">
              <SectionComponent />
            </section>
          </div>
        </div>

        <section className="grid items-start grid-cols-1 md:gap-4 md:grid-cols-3  mt-6">
          <div className="flex flex-col col-span-3 gap-4 md:col-span-2">
            <h1 className="mt-4 text-3xl font-bold md:text-6xl">
              {event.name}
            </h1>
            <section className="flex flex-col gap-4">
              {organizers && organizers.length > 0 && (
                <Hosts organizers={organizers} />
              )}
              <div className="grid grid-cols-1 gap-6 md:p-6 md:grid-cols-2 rounded-xl">
                {hasDate && (
                  <EventDetail label="Date" icon={CalendarIcon}>
                    <div
                      style={{ color: `#${event.background_color}` }}
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
                {hasLocation && <EventLocation event={event} />}
              </div>
              <div className="mt-10">
                {event.description && (
                  <div className="mt-4 markdown">
                    {/* eslint-disable-next-line react/no-children-prop */}
                    <ReactMarkdown children={event.description} />
                  </div>
                )}
              </div>
            </section>
          </div>
          <div className="flex flex-col gap-4">
            <section className="md:flex md:flex-col justify-center items-center hidden ">
              <SectionComponent />
            </section>
            {!hasPassed && (
              <RegistrationCard
                requiresApproval={event.requiresApproval}
                checkoutConfig={checkoutConfig}
              />
            )}
            {hasPassed && (
              <Card className="grid gap-4 mt-10 md:mt-0">
                <p className="text-lg">
                  <MdAssignmentLate />
                  This event is over. It is not possible to register for it
                  anymore.
                </p>
              </Card>
            )}
            <AttendeeCues checkoutConfig={checkoutConfig} />
          </div>
        </section>
      </div>

      <section className="flex flex-col">
        {isOrganizer && (
          <div className="grid gap-6 mt-12">
            <span className="text-2xl font-bold text-brand-dark">
              Tools for you, the event organizer
            </span>
            <div className="grid gap-4">
              <Disclosure
                label="Emails"
                description="Customize the emails your attendees will receive."
              >
                <div className="flex flex-col gap-4">
                  {Object.keys(checkoutConfig.config.locks).map(
                    (lockAddress: string) => {
                      const network =
                        checkoutConfig.config.locks[lockAddress].network ||
                        checkoutConfig.config.network
                      if (Object.keys(checkoutConfig.config.locks).length > 1) {
                        return (
                          <Disclosure
                            label={`Emails for ${minifyAddress(lockAddress)}`}
                            key={lockAddress}
                          >
                            <SettingEmail
                              key={lockAddress}
                              lockAddress={lockAddress}
                              network={network!}
                              isManager={true}
                              isLoading={false}
                            />
                          </Disclosure>
                        )
                      } else {
                        return (
                          <SettingEmail
                            key={lockAddress}
                            lockAddress={lockAddress}
                            network={network!}
                            isManager={true}
                            isLoading={false}
                          />
                        )
                      }
                    }
                  )}
                </div>
              </Disclosure>
              {/* Put that only if the event requires the checkout? */}
              <Card className="grid grid-cols-1 gap-2 md:items-center md:grid-cols-3">
                <div className="md:col-span-2">
                  <Card.Label
                    title="Checkout configuration"
                    description="Configure the checkout experience for your event: collect attendee info... etc."
                  />
                </div>
                <div className="md:col-span-1">
                  <Button
                    variant="black"
                    className="button border w-full"
                    size="small"
                    onClick={() => {
                      router.push(`/locks/checkout-url?id=${checkoutConfig.id}`)
                    }}
                  >
                    Configure
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default EventDetails
