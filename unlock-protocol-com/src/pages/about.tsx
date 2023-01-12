import type { NextPage } from 'next'
import { About } from '../components/pages/About'
import { routes } from '../config/routes'
import { NextSeo } from 'next-seo'
import { Layout } from '../components/layout/DefaultLayout'

const AboutPage: NextPage = () => {
  return (
    <Layout>
      <NextSeo
        title={routes.about.seo.title}
        description={routes.about.seo.description}
        openGraph={routes.about.seo.openGraph}
      />
      <About />
    </Layout>
  )
}

export default AboutPage
