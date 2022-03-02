import type { NextPage } from 'next'
import { Grants } from '../components/pages/Grants'
import { Layout } from '../components/layout/DefaultLayout'
import { NextSeo } from 'next-seo'
import { routes } from '../config/routes'
const GrantsPage: NextPage = () => {
  return (
    <Layout>
      <NextSeo
        title={routes.grants.seo.title}
        description={routes.grants.seo.description}
        openGraph={routes.grants.seo.openGraph}
      />
      <Grants />
    </Layout>
  )
}

export default GrantsPage
