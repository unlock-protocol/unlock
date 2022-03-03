import type { GetStaticProps, NextPage } from 'next'
import { Layout } from '../components/layout/DefaultLayout'
import Terms from '../components/pages/Terms.md'
import { markdownToHtml } from '../utils'
import { routes } from '../config/routes'
import { NextSeo } from 'next-seo'
interface Props {
  content: string
}

const TermsPage: NextPage<Props> = ({ content }) => {
  return (
    <Layout>
      <NextSeo
        title={routes.terms.seo.title}
        description={routes.terms.seo.description}
        openGraph={routes.terms.seo.openGraph}
      />
      <div className="p-6">
        <div className="mx-auto max-w-7xl">
          <article>
            <main
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{
                __html: content,
              }}
            ></main>
          </article>
        </div>
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const content = await markdownToHtml(Terms as unknown as string)
  return {
    props: {
      content,
    },
  }
}

export default TermsPage
