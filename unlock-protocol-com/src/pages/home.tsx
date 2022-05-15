import type { NextPage } from 'next'
import { Home } from '../components/pages/Home'
import { routes } from '../config/routes'
import { NextSeo } from 'next-seo'
import { Layout } from '../components/layout/DefaultLayout'

const HomePage: NextPage = () => {
  return (
    <Layout>
      <NextSeo
        title={routes.home.seo.title}
        description={routes.home.seo.description}
        openGraph={routes.home.seo.openGraph}
      />
      <Home />
    </Layout>
  )
}

export default HomePage
