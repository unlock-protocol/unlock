'use client'

import { BiQrScan as ScanIcon } from 'react-icons/bi'
import { useRouter } from 'next/navigation'
import {
  Button,
  Card,
  Disclosure,
  Icon,
  minifyAddress,
} from '@unlock-protocol/ui'
import { getEventUrl } from './utils'
import { useEventOrganizer } from '~/hooks/useEventOrganizer'
import { useEventOrganizers } from '~/hooks/useEventOrganizers'
import dayjs from 'dayjs'
import { Event, PaywallConfigType } from '@unlock-protocol/core'
import { useEvent } from '~/hooks/useEvent'
import { SettingEmail } from '~/components/interface/locks/Settings/elements/SettingEmail'
import { FaUsers } from 'react-icons/fa'
import { TbSettings } from 'react-icons/tb'
import { useEventVerifiers } from '~/hooks/useEventVerifiers'
import { EventDefaultLayout } from './Layout/EventDefaultLayout'
import { EventBannerlessLayout } from './Layout/EventBannerlessLayout'
import { EventsLayout } from './Layout/constants'
import { formatEventDates } from '~/utils/formatEventDates'

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

  // Check if the user is one of the lock managers
  const { data: isOrganizer } = useEventOrganizer({
    checkoutConfig,
  })

  const { refetch, data: event } = useEvent(
    { slug: eventProp.slug },
    { initialData: eventProp }
  )

  const eventUrl = getEventUrl({ event })

  const { data: organizers } = useEventOrganizers({
    checkoutConfig,
  }) as { data: string[] | undefined }

  const {
    data: verifier,
    isError,
    error,
  } = useEventVerifiers({ event: eventProp })

  if (isError) {
    console.error(
      error ??
        'We could not load the list of verifiers for your lock. Please reload to try again.'
    )
  }

  // Format the event dates and get boolean flags
  const {
    startDate,
    startTime,
    endDate,
    endTime,
    eventDate,
    eventEndDate,
    hasDate,
    hasLocation,
  } = formatEventDates(event.ticket, language())

  const hasPassed = eventEndDate
    ? dayjs().isAfter(eventEndDate)
    : dayjs().isAfter(eventDate)

  const coverImage = event.ticket.event_cover_image

  const layoutProps = {
    event,
    checkoutConfig,
    hasLocation,
    hasDate,
    startDate,
    startTime,
    endDate,
    endTime,
    eventUrl,
    hasPassed,
    organizers,
    coverImage,
    refetch,
  }

  const renderEventLayout = () => {
    switch (event.layout) {
      case EventsLayout.Bannerless:
        return <EventBannerlessLayout {...layoutProps} />
      default:
        return <EventDefaultLayout {...layoutProps} />
    }
  }

  return (
    <div>
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
      </div>
      {renderEventLayout()}
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
