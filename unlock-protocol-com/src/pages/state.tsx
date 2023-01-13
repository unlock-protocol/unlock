import type { GetStaticProps, NextPage } from 'next'
import { State } from '../components/pages/State'
import { routes } from '../config/routes'
import { NextSeo } from 'next-seo'
import { Layout } from '../components/layout/DefaultLayout'

const StatePage = () => (
  <Layout>
    <NextSeo
      title={routes.state.seo.title}
      description={routes.state.seo.description}
      openGraph={routes.state.seo.openGraph}
    />
    <State />
  </Layout>
)

export default StatePage
