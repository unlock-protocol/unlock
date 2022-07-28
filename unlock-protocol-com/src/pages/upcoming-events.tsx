import type { NextPage } from 'next'
import { routes } from '../config/routes'
import { NextSeo } from 'next-seo'
import { Layout } from '../components/layout/DefaultLayout'
import { UpcomingEvents } from '../components/pages/UpcomingEvents'

const MembershipPage: NextPage = () => {
  return (
    <Layout>
      <NextSeo
        title={routes.upcomingEvents.seo.title}
        description={routes.upcomingEvents.seo.description}
        openGraph={routes.upcomingEvents.seo.openGraph}
      />
      <UpcomingEvents />
    </Layout>
  )
}

export default MembershipPage
