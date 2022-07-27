import type { NextPage } from 'next'
import { routes } from '../config/routes'
import { NextSeo } from 'next-seo'
import { Layout } from '../components/layout/DefaultLayout'
import { Events } from '../components/pages/Events'

const MembershipPage: NextPage = () => {
  return (
    <Layout>
      <NextSeo
        title={routes.upcomingEvents.seo.title}
        description={routes.upcomingEvents.seo.description}
        openGraph={routes.upcomingEvents.seo.openGraph}
      />
      <Events />
    </Layout>
  )
}

export default MembershipPage
