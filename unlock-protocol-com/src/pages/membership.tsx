import type { NextPage } from 'next'
import { Membership } from '../components/pages/Membership'
import { routes } from '../config/routes'
import { NextSeo } from 'next-seo'
import { Layout } from '../components/layout/DefaultLayout'

const MembershipPage: NextPage = () => {
  return (
    <Layout>
      <NextSeo
        title={routes.membership.seo.title}
        description={routes.membership.seo.description}
        openGraph={routes.membership.seo.openGraph}
      />
      <Membership />
    </Layout>
  )
}

export default MembershipPage
