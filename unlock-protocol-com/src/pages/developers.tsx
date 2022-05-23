import type { NextPage } from 'next'
import { Developers } from '../components/pages/Developers'
import { routes } from '../config/routes'
import { NextSeo } from 'next-seo'
import { Layout } from '../components/layout/DefaultLayout'

const DevelopersPage: NextPage = () => {
  return (
    <Layout>
      <NextSeo
        title={routes.developers.seo.title}
        description={routes.developers.seo.description}
        openGraph={routes.developers.seo.openGraph}
      />
      <Developers />
    </Layout>
  )
}

export default DevelopersPage
