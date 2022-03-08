import type { GetStaticProps, NextPage } from 'next'
import { About } from '../components/pages/About'
import { BLOG_PAGE_SIZE } from '../config/constants'
import { BLOG_PATH, getPosts, PostType } from '../utils'
import { routes } from '../config/routes'
import { NextSeo } from 'next-seo'
import { Layout } from '../components/layout/DefaultLayout'

interface Props {
  updates: PostType[]
}

const AboutPage: NextPage<Props> = ({ updates }: Props) => {
  return (
    <Layout>
      <NextSeo
        title={routes.about.seo.title}
        description={routes.about.seo.description}
        openGraph={routes.about.seo.openGraph}
      />
      <About updates={updates} />
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = await getPosts(BLOG_PATH)
  return {
    props: {
      updates: posts.slice(0, BLOG_PAGE_SIZE),
    },
  }
}

export default AboutPage
