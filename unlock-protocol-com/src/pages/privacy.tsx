import type { GetStaticProps, NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { Layout } from '../components/layout/DefaultLayout'
import Privacy from '../components/pages/Privacy.md'
import { markdownToHtml } from '../utils'
import { routes } from '../config/routes'
interface Props {
  content: string
}

const PrivacyPage: NextPage<Props> = ({ content }) => {
  return (
    <Layout>
      <NextSeo
        title={routes.privacy.seo.title}
        description={routes.privacy.seo.description}
        openGraph={routes.privacy.seo.openGraph}
      />
      <div className="max-w-7xl	 p-6 mx-auto">
        <article>
          <main
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{
              __html: content,
            }}
          ></main>
        </article>
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const content = await markdownToHtml(Privacy as unknown as string)
  return {
    props: {
      content,
    },
  }
}

export default PrivacyPage
