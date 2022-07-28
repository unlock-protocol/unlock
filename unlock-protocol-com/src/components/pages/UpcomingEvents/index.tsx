import { useEffect, useState } from 'react'
import { CalendarEvent, icalEventsToJson } from '../../../utils/calendar'
import { UpcomingEventBox } from './UpcomingEventBox'

const CALENDAR_URL =
  'https://calendar.google.com/calendar/ical/c_dm3gud9ph6jqk7epq6jtij8u00%40group.calendar.google.com/public/basic.ics'

export function UpcomingEvents() {
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([])
  const [pastEvents, setPastEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)

  const getEvents = async () => {
    setLoading(true)
    setUpcomingEvents(await icalEventsToJson(CALENDAR_URL, 'future'))
    setPastEvents(await icalEventsToJson(CALENDAR_URL, 'past'))
    setLoading(false)
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
        {loading ? (
          <section className="grid grid-cols-1 gap-8 py-10 lg:grid-cols-3">
            <UpcomingEventPlaceholder />
            <UpcomingEventPlaceholder />
            <UpcomingEventPlaceholder />
            <UpcomingEventPlaceholder />
            <UpcomingEventPlaceholder />
            <UpcomingEventPlaceholder />
          </section>
        ) : (
          <>
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
                    return (
                      <UpcomingEventBox key={index} event={event} disabled />
                    )
                  })}
                </section>
              ) : (
                <h2 className="mt-5 text-slg">There is no past event</h2>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}

const UpcomingEventPlaceholder = () => {
  return (
    <div className="flex flex-col h-full gap-4 p-7 glass-pane rounded-xl">
      <div className="flex gap-2">
        <div className="bg-gray-200 animate-pulse inline-block w-[20px] h-[20px]"></div>
        <div className="bg-gray-200 animate-pulse w-full h-[20px]"></div>
        <div className="bg-gray-200 animate-pulse w-full h-[20px]"></div>
      </div>
      <div className="bg-gray-200 animate-pulse inline-block w-full h-[35px]"></div>
      <div className="flex flex-col gap-3">
        <div className="bg-gray-200 animate-pulse w-full h-[20px]"></div>
        <div className="bg-gray-200 animate-pulse w-full h-[20px]"></div>
        <div className="bg-gray-200 animate-pulse w-full h-[20px]"></div>
        <div className="bg-gray-200 animate-pulse w-full h-[20px]"></div>
      </div>
      <div className="flex gap-2">
        <div className="bg-gray-200 animate-pulse  w-[40px] h-[40px]"></div>
        <div className="bg-gray-200 animate-pulse  w-full h-[40px]"></div>
      </div>
      <div className="w-full h-[50px] rounded-full bg-gray-200 animate-pulse"></div>
    </div>
  )
}
