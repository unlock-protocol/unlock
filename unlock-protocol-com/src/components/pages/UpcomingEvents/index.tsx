import { useEffect, useState } from 'react'
import { CalendarEvent, icalEventsToJson } from '../../../utils/calendar'
import { UpcomingEventBox } from './UpcomingEventBox'

export function UpcomingEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])

  const getEvents = async () => {
    setEvents(await icalEventsToJson('./events.ics'))
  }

  useEffect(() => {
    getEvents()
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-0">
      <header className="flex flex-col gap-[16px] pt-[24px]">
        <h1 className="heading">Upcoming Events</h1>
        <p className="text-lg">
          Join us for AMA, Governance and other activities
        </p>
      </header>

      <section className="grid grid-cols-1 gap-8 py-10 lg:grid-cols-3">
        {events?.map((event, index) => {
          return <UpcomingEventBox key={index} event={event} />
        })}
      </section>
    </div>
  )
}
