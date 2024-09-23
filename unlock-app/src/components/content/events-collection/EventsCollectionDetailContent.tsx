'use client'
import { Button, Icon, Placeholder } from '@unlock-protocol/ui'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useMemo, useState } from 'react'

import { TbSettings } from 'react-icons/tb'
import { EventCollection } from '@unlock-protocol/unlock-js'
import { useRouter } from 'next/navigation'
import { EventOverviewCard } from './EventOverviewCard'
import { ImageBar } from '~/components/interface/locks/Manage/elements/ImageBar'
import { FaGithub, FaYoutube, FaGlobe, FaTwitter } from 'react-icons/fa'
import Link from 'next/link'
import FarcasterIcon from './icons/FarcasterIcon'
import EventDetailDrawer from './EventDetailDawer'

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

export interface Event {
  name: string
  data: EventData
  createdBy: string
  createdAt: string
  updatedAt: string
  slug: string
  checkoutConfigId: string
}

interface EventsCollectionDetailContentProps {
  eventCollection: EventCollection
}

export default function EventsCollectionDetailContent({
  eventCollection,
}: EventsCollectionDetailContentProps) {
  const { account } = useAuth()
  const router = useRouter()

  // Event detail drawer
  const [isEventDetailDrawerOpen, setIsEventDetailDrawerOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const hasValidEvents = useMemo(() => {
    return (
      eventCollection.events?.some(
        (event) => event.name !== null && event.slug !== null
      ) ?? false
    )
  }, [eventCollection.events])

  const isManager = useMemo(() => {
    if (!account) return false
    return eventCollection.managerAddresses?.includes(account)
  }, [account, eventCollection.managerAddresses])

  const handleEventDetailClick = (event: Event) => {
    setSelectedEvent(event)
    setIsEventDetailDrawerOpen(true)
  }

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
      <div className="flex flex-col-reverse px-4 md:px-0 md:flex-row-reverse gap-2 ">
        {isManager && (
          <Button
            onClick={() => {
              router.push(`/events/${eventCollection.slug}/settings`)
            }}
          >
            <div className="flex items-center gap-2">
              <Icon icon={TbSettings} size={20} />
              <span>Settings</span>
            </div>
          </Button>
        )}
        <div className="md:hidden items-center justify-end gap-0 mt-auto md:gap-2 w-full sm:w-auto"></div>
      </div>
      <div className="pt-4">
        <div className="relative">
          <div className="w-full hidden sm:block sm:overflow-hidden bg-slate-200 max-h-80 sm:rounded-3xl">
            <img
              className="object-cover w-full h-full"
              src={
                eventCollection.banner ||
                'https://avatars.githubusercontent.com/u/46839250?v=4'
              }
              alt="Cover image"
            />
          </div>
        </div>
        <div className="sm:absolute flex sm:flex-col w-full gap-6 sm:pl-10 -bottom-12">
          <section className="flex justify-between flex-col sm:flex-row w-full">
            <div className="flex p-1 bg-white sm:p-2 sm:w-48 sm:h-48 sm:rounded-3xl rounded-xl border mb-4 sm:mb-0">
              <img
                alt={eventCollection.title}
                className="object-cover w-full m-auto aspect-1 sm:rounded-2xl rounded-lg"
                src={
                  eventCollection.coverImage ||
                  'https://avatars.githubusercontent.com/u/46839250?v=4'
                }
              />
            </div>

            <div className="hidden md:flex items-center justify-end gap-0 mt-auto md:gap-2 w-full sm:w-auto"></div>
          </section>
        </div>
      </div>

      <section className="grid items-start grid-cols-1 md:gap-4 md:grid-cols-3 md:mt-16 mt-8">
        <div className="flex flex-col col-span-3 gap-4 md:col-span-2">
          <h1 className="text-3xl font-bold md:text-6xl">
            {eventCollection.title}
          </h1>
          <p className="text-sm md:text-base">{eventCollection.description}</p>
          <div className="flex space-x-6">
            {eventCollection.links &&
              Array.isArray(eventCollection.links) &&
              eventCollection.links.map(
                (link: { type: string; url: string }, index: number) => (
                  <Link
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {getLinkIcon(link.type)}
                  </Link>
                )
              )}
          </div>
        </div>
      </section>

      {/* List of Events */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold">Events</h2>
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-14 mt-5">
          <div className="flex flex-col gap-6 lg:col-span-8">
            {hasValidEvents ? (
              <div className="">
                <div className="space-y-6">
                  {eventCollection.events?.map((eventItem: any) => (
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
                description={<p>No events have been added yet.</p>}
              />
            )}
          </div>
          <div className="lg:col-span-4">
            <Placeholder.Root>
              <Placeholder.Card size="xl" />
            </Placeholder.Root>
          </div>
        </div>
      </section>

      {/* Event Detail Drawer */}
      <EventDetailDrawer
        isOpen={isEventDetailDrawerOpen}
        setIsOpen={setIsEventDetailDrawerOpen}
        event={selectedEvent}
      />
    </div>
  )
}
