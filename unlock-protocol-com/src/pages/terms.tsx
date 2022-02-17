import type { GetStaticProps, NextPage } from 'next'
import { CenteredColumn } from '../components/layout/Columns'
import { Layout } from '../components/layout/DefaultLayout'
import Terms from '../components/pages/Terms.md'
import { markdownToHtml } from '../utils'

interface Props {
  content: string
}

const TermsPage: NextPage<Props> = ({ content }) => {
  return (
    <Layout>
      <CenteredColumn>
        <div className="pt-24 px-6  pb-8">
          <article>
            <main
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{
                __html: content,
              }}
            ></main>
          </article>
        </div>
      </CenteredColumn>
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
