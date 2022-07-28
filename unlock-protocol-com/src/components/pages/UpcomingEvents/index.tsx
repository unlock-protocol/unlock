import { useEffect, useState } from 'react'
import { CalendarEvent, icalEventsToJson } from '../../../utils/calendar'
import { UpcomingEventBox } from './UpcomingEventBox'

export function UpcomingEvents() {
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([])
  const [pastEvents, setPastEvents] = useState<CalendarEvent[]>([])

  const getEvents = async () => {
    setUpcomingEvents(await icalEventsToJson('./events.ics', 'future'))
    setPastEvents(await icalEventsToJson('./events.ics', 'past'))
  }

  useEffect(() => {
    getEvents()
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-6">
      <header className="flex flex-col gap-2 pt-3">
        <h1 className="heading">Upcoming Events</h1>
        <p className="text-lg">
          Join us for AMA, Governance and other activities
        </p>
      </header>

      <div className="min-h-screen">
        {upcomingEvents?.length > 0 ? (
          <section className="grid grid-cols-1 gap-8 py-10 lg:grid-cols-3">
            {upcomingEvents?.map((event, index) => {
              return <UpcomingEventBox key={index} event={event} />
            })}
          </section>
        ) : (
          <h2 className="mt-5 text-slg">There is no upcoming event</h2>
        )}

        <section>
          <h1 className="heading">Past Events</h1>
          {pastEvents?.length > 0 ? (
            <section className="grid grid-cols-1 gap-8 py-10 lg:grid-cols-3">
              {pastEvents?.map((event, index) => {
                return <UpcomingEventBox key={index} event={event} disabled />
              })}
            </section>
          ) : (
            <h2 className="mt-5 text-slg">There is no past event</h2>
          )}
        </section>
      </div>
    </div>
  )
}
