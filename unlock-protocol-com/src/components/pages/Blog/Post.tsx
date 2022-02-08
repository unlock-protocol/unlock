import type { PostType } from '../../../utils/posts'
import { MarketingLayout } from '../../layout/MarketingLayout'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
export interface Props extends PostType {
  source: MDXRemoteSerializeResult
}

const components = {}

export function Post({ frontMatter, source }: Props) {
  const publishedDate = new Date(frontMatter.publishDate).toLocaleDateString()
  return (
    <MarketingLayout>
      <article>
        <div className="max-w-screen-md mx-auto">
          <header className="py-4 space-y-2">
            <h1 className="text-3xl font-bold sm:text-5xl">
              {frontMatter.title}
            </h1>
            <div className="space-y-1">
              <p className="text-lg sm:text-xl text-brand-gray">
                {frontMatter.description}
              </p>
              <div className="text-base text-brand-gray">
                By <span> {frontMatter.authorName} </span> on{' '}
                <time dateTime={publishedDate}>{publishedDate}</time>
              </div>
            </div>
          </header>
          <div className="prose sm:prose-lg prose-img:rounded-xl prose-a:text-brand-ui-primary hover:prose-a:text-brand-ui-secondary prose-slate ">
            <MDXRemote {...source} components={components} />
          </div>
        </div>
      </article>
    </MarketingLayout>
  )
}
