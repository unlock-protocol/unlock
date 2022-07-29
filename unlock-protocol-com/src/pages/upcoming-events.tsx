import type { GetStaticProps, NextPage } from 'next'
import { routes } from '../config/routes'
import { NextSeo } from 'next-seo'
import { Layout } from '../components/layout/DefaultLayout'
import {
  UpcomingEvents,
  UpcomingEventsProps,
} from '../components/pages/UpcomingEvents'
import { icalEventsToJson } from '../utils/calendar'

const MembershipPage: NextPage = (props) => {
  return (
    <Layout>
      <NextSeo
        title={routes.upcomingEvents.seo.title}
        description={routes.upcomingEvents.seo.description}
        openGraph={routes.upcomingEvents.seo.openGraph}
      />
      <UpcomingEvents {...props} />
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<UpcomingEventsProps> = async () => {
  const CALENDAR_URL =
    'https://calendar.google.com/calendar/ical/c_dm3gud9ph6jqk7epq6jtij8u00%40group.calendar.google.com/public/basic.ics'

  const [rawUpcomingEvents, rawPastEvents] = await Promise.all([
    icalEventsToJson(CALENDAR_URL, 'future'),
    icalEventsToJson(CALENDAR_URL, 'past', 'desc'),
  ])

  const upcomingEvents = JSON.parse(JSON.stringify(rawUpcomingEvents)) ?? []
  const pastEvents = JSON.parse(JSON.stringify(rawPastEvents)) ?? []

  return {
    props: {
      upcomingEvents,
      pastEvents,
    },
  }
}

export default MembershipPage
