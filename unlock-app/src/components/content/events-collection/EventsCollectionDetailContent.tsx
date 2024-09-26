'use client'
import { Button, Icon } from '@unlock-protocol/ui'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useMemo, useState } from 'react'

import { TbPlus, TbSettings } from 'react-icons/tb'
import { useRouter } from 'next/navigation'
import { EventOverviewCard } from './EventOverviewCard'
import { ImageBar } from '~/components/interface/locks/Manage/elements/ImageBar'

import Link from 'next/link'

import { useEventCollectionDetails } from '~/hooks/useEventCollection'
import { isCollectionManager } from '~/utils/eventCollections'
import { FaGithub, FaGlobe, FaTwitter, FaYoutube } from 'react-icons/fa'
import { SiFarcaster as FarcasterIcon } from 'react-icons/si'
import AddEventsToCollectionDrawer from './AddEventsToCollectionDawer'
import { EventDetailDrawer } from './EventDetailDawer'
import { Metadata } from '@unlock-protocol/core'
import CopyUrlButton from '../event/CopyUrlButton'
import TweetItButton from '../event/TweetItButton'
import { config } from '~/config/app'
import CastItButton from '../event/CastItButton'

export interface EventTicket {
  event_address: string
  event_end_date: string
  event_end_time?: string
  event_location: string
  event_timezone: string
  event_start_date: string
  event_start_time?: string
  event_is_in_person: boolean
}

export interface EventAttributes {
  trait_type: string
  value: string
}

export interface EventData {
  name: string
  slug: string
  image: string
  ticket: EventTicket
  replyTo: string
  attributes: EventAttributes[]
  description: string
  emailSender: string
  requiresApproval: boolean
}

export interface Event extends Metadata {
  eventUrl: string
  ticket: EventTicket
}

interface EventsCollectionDetailContentProps {
  slug: string
}

export default function EventsCollectionDetailContent({
  slug,
}: EventsCollectionDetailContentProps) {
  const { data: eventCollection } = useEventCollectionDetails(slug)

  const { account } = useAuth()
  const router = useRouter()

  const [isAddEventDrawerOpen, setIsAddEventDrawerOpen] = useState(false)

  // event detail drawer
  const [isEventDetailDrawerOpen, setIsEventDetailDrawerOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)

  const hasValidEvents = useMemo(() => {
    return (
      eventCollection?.events?.some(
        (event) => event.name !== null && event.slug !== null
      ) ?? false
    )
  }, [eventCollection?.events])
  const isManager = isCollectionManager(
    eventCollection?.managerAddresses,
    account!
  )

  const handleAddEvent = () => {
    setIsAddEventDrawerOpen(true)
  }
  const handleEventDetailClick = (event: Event) => {
    setSelectedEvent(event)
    setIsEventDetailDrawerOpen(true)
  }

  // Extract existing event slugs
  const existingEventSlugs = useMemo(() => {
    return eventCollection?.events?.map((event) => event.slug) || []
  }, [eventCollection?.events])

  const getLinkIcon = (type: string) => {
    switch (type) {
      case 'github':
        return <FaGithub size={20} className="text-brand-ui-primary" />
      case 'youtube':
        return <FaYoutube size={20} className="text-brand-ui-primary" />
      case 'website':
        return <FaGlobe size={20} className="text-brand-ui-primary" />
      case 'x':
        return <FaTwitter size={20} className="text-brand-ui-primary" />
      case 'farcaster':
        return <FarcasterIcon size={20} className="text-brand-ui-primary" />
      default:
        return <FaGlobe size={20} className="text-brand-ui-primary" />
    }
  }

  return (
    <div>
      <div className="flex flex-col-reverse px-4 md:px-0 md:flex-row-reverse gap-2">
        {isManager && (
          <Button
            onClick={() => {
              router.push(`/events/${eventCollection?.slug}/settings`)
            }}
          >
            <div className="flex items-center gap-2">
              <Icon icon={TbSettings} size={20} />
              <span>Settings</span>
            </div>
          </Button>
        )}
      </div>
      <div className="pt-4">
        <div className="relative">
          <div className="w-full hidden sm:block sm:overflow-hidden bg-slate-200 max-h-80 sm:rounded-3xl">
            <img
              className="object-cover w-full h-full"
              src={eventCollection?.banner || ''}
              alt="Cover image"
            />
          </div>

          <div className="sm:absolute flex sm:flex-col w-full gap-6 sm:pl-10 -bottom-12">
            <section className="flex justify-between flex-col sm:flex-row w-full">
              <div className="flex p-1 bg-white sm:p-2 sm:w-48 sm:h-48 sm:rounded-3xl rounded-xl border mb-4 sm:mb-0">
                <img
                  alt={eventCollection?.title}
                  className="object-cover w-full m-auto aspect-1 sm:rounded-2xl rounded-lg"
                  src={eventCollection?.coverImage || ''}
                />
              </div>

              <div className="flex items-center justify-center gap-0 mt-auto md:gap-2 w-full sm:w-auto">
                {eventCollection && (
                  <ul className="flex items-center justify-center gap-0 mt-auto md:gap-2">
                    <li>
                      <TweetItButton eventCollection={eventCollection!} />
                    </li>
                    <li>
                      <CastItButton eventCollection={eventCollection} />
                    </li>
                    <li>
                      <CopyUrlButton
                        url={`${config.unlockApp}/events/${eventCollection.slug}`}
                      />
                    </li>
                  </ul>
                )}
              </div>
            </section>
          </div>
        </div>

        <section className="grid items-start grid-cols-1 md:gap-4 md:grid-cols-3 md:mt-16 mt-8">
          <div className="flex flex-col col-span-3 gap-4 md:col-span-2">
            <h1 className="text-3xl font-bold md:text-6xl">
              {eventCollection?.title}
            </h1>
            <p className="text-sm md:text-base">
              {eventCollection?.description}
            </p>
            <div className="flex space-x-6">
              {Array.isArray(eventCollection?.links) &&
                eventCollection?.links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {getLinkIcon(link.type!)}
                  </Link>
                ))}
            </div>
          </div>
        </section>

        {/* list of events */}
        <section className="mt-16">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-14 mt-5">
            <div className="lg:col-span-1"></div>
            <div className="flex flex-col gap-6 lg:col-span-10">
              <div className="flex flex-col sm:flex-row items-center space-y-2 justify-between mt-5">
                <h2 className="text-3xl font-bold">Events</h2>
                <Button
                  onClick={handleAddEvent}
                  className="w-full sm:w-auto"
                  disabled={!account}
                >
                  <div className="flex items-center gap-2">
                    <Icon icon={TbPlus} size={20} />
                    {isManager ? 'Add Event' : 'Submit Event'}
                  </div>
                </Button>
              </div>
              {hasValidEvents ? (
                <div className="">
                  <div className="space-y-6">
                    {eventCollection?.events?.map((eventItem: any) => (
                      <EventOverviewCard
                        key={eventItem.slug}
                        event={eventItem}
                        onClick={handleEventDetailClick}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <ImageBar
                  src="/images/illustrations/no-locks.svg"
                  description={
                    <div>
                      No events have been added yet.{' '}
                      <span
                        onClick={handleAddEvent}
                        className="text-brand-ui-primary cursor-pointer"
                      >
                        {isManager ? 'Add an event' : 'Submit an event'}
                      </span>
                    </div>
                  }
                />
              )}
            </div>
            <div className="lg:col-span-1"></div>
          </div>
        </section>
      </div>

      {/* Add Event Drawer */}
      <AddEventsToCollectionDrawer
        collectionSlug={eventCollection?.slug}
        isOpen={isAddEventDrawerOpen}
        setIsOpen={setIsAddEventDrawerOpen}
        isManager={isManager!}
        existingEventSlugs={existingEventSlugs}
      />
      {/* Event Detail Drawer */}
      <EventDetailDrawer
        isOpen={isEventDetailDrawerOpen}
        setIsOpen={setIsEventDetailDrawerOpen}
        event={selectedEvent}
      />
    </div>
  )
}
