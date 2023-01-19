import type { GetStaticProps, NextPage } from 'next'
import { routes } from '../config/routes'
import { NextSeo } from 'next-seo'
import { Layout } from '../components/layout/DefaultLayout'
import {
  UpcomingEvents,
  UpcomingEventsProps,
} from '../components/pages/UpcomingEvents'
import { getEvents } from '../utils/calendar'

const MembershipPage: NextPage = (props: any) => {
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
  const [upcomingEvents, pastEvents] = await Promise.all([
    getEvents('future'),
    getEvents('past'),
  ])

  return {
    props: {
      upcomingEvents: upcomingEvents.reverse(),
      pastEvents,
    },
  }
}

export default MembershipPage
