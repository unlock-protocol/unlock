import { Layout } from '../components/layout/DefaultLayout'
import { Jobs } from '../components/pages/Jobs'
import { routes } from '../config/routes'
import { NextSeo } from 'next-seo'

const JobsPage = () => (
  <Layout>
    <NextSeo
      title={routes.jobs.seo.title}
      description={routes.jobs.seo.description}
      openGraph={routes.jobs.seo.openGraph}
    />
    <Jobs />
  </Layout>
)

export default JobsPage
