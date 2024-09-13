import React, { useState } from 'react'
import { CoverImageDrawer } from '../CoverImageDrawer'
import { Event, PaywallConfigType } from '@unlock-protocol/core'
import AddToCalendarButton from '../AddToCalendarButton'
import TweetItButton from '../TweetItButton'
import CastItButton from '../CastItButton'
import CopyUrlButton from '../CopyUrlButton'
import Hosts from '../Hosts'
import { EventDetail } from '../EventDetail'
import { EventLocation } from '../EventLocation'
import ReactMarkdown from 'react-markdown'
import { RegistrationCard } from '../Registration/RegistrationCard'
import { AttendeeCues } from '../Registration/AttendeeCues'
import { AiOutlineCalendar as CalendarIcon } from 'react-icons/ai'
import { AttendeeStaking } from '../Registration/SingleLock/AttendeeStaking'
import PastEvent from './PastEvent'

type EventDefaultLayoutProps = {
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
  hasLocation: boolean
  hasDate: string | null
  coverImage: string
  refetch: () => void
  organizers: string[] | undefined
  startDate: string | null
  endDate: string | null
  startTime: string | undefined
  endTime: string | null
  eventUrl: string
  hasPassed: boolean
}

export const EventDefaultLayout = ({
  event,
  checkoutConfig,
  hasLocation,
  hasDate,
  coverImage,
  refetch,
  organizers,
  startDate,
  endDate,
  startTime,
  endTime,
  eventUrl,
  hasPassed,
}: EventDefaultLayoutProps) => {
  const [image, setImage] = useState('')
  return (
    <div className="pt-4">
      <div className="relative">
        <div className="w-full hidden sm:block sm:overflow-hidden bg-slate-200 max-h-80 sm:rounded-3xl">
          <img
            className="object-cover w-full h-full"
            src={coverImage || event.image}
            alt="Cover image"
          />
        </div>

        <CoverImageDrawer
          image={image}
          setImage={setImage}
          checkoutConfig={checkoutConfig}
          event={event}
          handleClose={() => {
            refetch()
          }}
        />

        <div className="sm:absolute flex sm:flex-col w-full gap-6 px-4 sm:px-10 -bottom-12">
          <section className="flex justify-between flex-col sm:flex-row">
            <div className="flex p-1 bg-white sm:p-2 sm:w-48 sm:h-48 sm:rounded-3xl rounded-xl border">
              <img
                // @ts-expect-error protperty 'title' does not exist on type 'Event'
                alt={event.title}
                className="object-cover w-full m-auto aspect-1 sm:rounded-2xl rounded-lg"
                src={event.image}
              />
            </div>
            <ul className="flex items-center justify-center gap-0 mt-auto md:gap-2">
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
          </section>
        </div>
      </div>

      <section className="grid items-start grid-cols-1 md:gap-4 md:grid-cols-3 md:mt-16 mt-8">
        <div className="flex flex-col col-span-3 gap-4 md:col-span-2">
          <h1 className="mt-4 text-3xl font-bold md:text-6xl">{event.name}</h1>
          <section className="flex flex-col gap-4">
            {organizers && organizers.length > 0 && (
              <Hosts organizers={organizers} />
            )}
            <div className="grid grid-cols-1 gap-6 md:p-6 md:grid-cols-2 rounded-xl">
              {hasDate && (
                <EventDetail label="Date" icon={CalendarIcon}>
                  <div
                    // @ts-expect-error protperty 'background_color' does not exist on type 'Event'
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
                  <ReactMarkdown children={event.description} />
                </div>
              )}
            </div>
          </section>
        </div>
        <div className="flex flex-col gap-4">
          {!hasPassed && (
            <>
              <RegistrationCard
                requiresApproval={event.requiresApproval}
                checkoutConfig={checkoutConfig}
                hideRemaining={!!event.hideRemaining}
              />
              {event.attendeeRefund && (
                <AttendeeStaking attendeeRefund={event.attendeeRefund} />
              )}
            </>
          )}
          {hasPassed && (
            <PastEvent event={event} checkoutConfig={checkoutConfig} />
          )}
          <AttendeeCues checkoutConfig={checkoutConfig} />
        </div>
      </section>
    </div>
  )
}
